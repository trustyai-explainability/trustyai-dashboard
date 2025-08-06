// Test constants
export const TEST_STORAGE_KEY = 'test-storage-key';
export const DEFAULT_OBJECT = { name: 'test', value: 123 };
export const DEFAULT_STRING = 'default-string';

// Mock storage objects
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

// Mock global storage objects
export const setupMockStorage = (): void => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });
};

// Test data
export const TEST_VALUES = {
  storedObject: { name: 'stored', value: 456 },
  newObject: { name: 'new', value: 789 },
  sessionObject: { name: 'session-test', value: 456 },
  sessionStoredObject: { name: 'session-stored', value: 789 },
  newString: 'new-string-value',
  storedString: 'stored-string-value',
  testObject: { name: 'test', value: 999 },
} as const;
