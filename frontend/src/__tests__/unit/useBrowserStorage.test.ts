import { renderHook, act } from '@testing-library/react';
import { useBrowserStorage } from '~/app/utilities/useBrowserStorage';
import {
  TEST_STORAGE_KEY,
  DEFAULT_OBJECT,
  DEFAULT_STRING,
  mockLocalStorage,
  mockSessionStorage,
  TEST_VALUES,
  setupMockStorage,
} from './useBrowserStorage.constants';

// Setup mock storage
setupMockStorage();

describe('useBrowserStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('basic functionality', () => {
    it('should return default value when no stored value exists', () => {
      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [value, setValue] = result.current;
      expect(value).toEqual(DEFAULT_OBJECT);
      expect(typeof setValue).toBe('function');
    });

    it('should return stored JSON value when it exists', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(TEST_VALUES.storedObject));

      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [value] = result.current;
      expect(value).toEqual(TEST_VALUES.storedObject);
    });

    it('should store JSON value successfully', () => {
      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue(TEST_VALUES.newObject);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        TEST_STORAGE_KEY,
        JSON.stringify(TEST_VALUES.newObject),
      );
    });
  });

  describe('sessionStorage', () => {
    it('should use sessionStorage when specified', () => {
      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, true),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue(TEST_VALUES.sessionObject);
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        TEST_STORAGE_KEY,
        JSON.stringify(TEST_VALUES.sessionObject),
      );
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should read from sessionStorage when specified', () => {
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(TEST_VALUES.sessionStoredObject));

      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, true),
      );

      const [value] = result.current;
      expect(value).toEqual(TEST_VALUES.sessionStoredObject);
    });
  });

  describe('string values', () => {
    it('should handle string values when jsonify is false', () => {
      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_STRING, false, false),
      );

      const [value, setValue] = result.current;
      expect(value).toBe(DEFAULT_STRING);

      act(() => {
        setValue(TEST_VALUES.newString);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        TEST_STORAGE_KEY,
        TEST_VALUES.newString,
      );
    });

    it('should read string values from storage when jsonify is false', () => {
      mockLocalStorage.getItem.mockReturnValue(TEST_VALUES.storedString);

      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_STRING, false, false),
      );

      const [value] = result.current;
      expect(value).toBe(TEST_VALUES.storedString);
    });
  });

  describe('error handling', () => {
    it('should handle JSON parsing errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [value] = result.current;
      expect(value).toEqual(DEFAULT_OBJECT);
    });

    it('should handle storage access errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [value] = result.current;
      expect(value).toEqual(DEFAULT_OBJECT);
    });

    it('should handle storage write errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage write error');
      });

      const { result } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue(TEST_VALUES.testObject);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('hook behavior', () => {
    it('should return stable setter function', () => {
      const { result, rerender } = renderHook(() =>
        useBrowserStorage(TEST_STORAGE_KEY, DEFAULT_OBJECT, true, false),
      );

      const [, setValue1] = result.current;
      rerender();
      const [, setValue2] = result.current;

      expect(setValue1).toBe(setValue2);
    });
  });
});
