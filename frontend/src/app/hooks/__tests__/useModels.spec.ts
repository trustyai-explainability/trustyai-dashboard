import { renderHook, waitFor } from '@testing-library/react';
import { ModelService } from '~/app/api/service';
import { useModels, ModelOption } from '~/app/hooks/useModels';
import { mockModels, initialState, expectLoadedState } from './testUtils';

jest.mock('~/app/api/service', () => ({
  ModelService: {
    getModels: jest.fn(),
  },
}));

const mockModelService = ModelService as jest.Mocked<typeof ModelService>;

describe('useModels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useModels());
    expect(result.current).toEqual(initialState);
  });

  it('should fetch models successfully', async () => {
    mockModelService.getModels.mockResolvedValue(mockModels);
    const { result } = renderHook(() => useModels());

    expect(result.current).toEqual(initialState);

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current).toEqual(expectLoadedState(mockModels));
    expect(mockModelService.getModels).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching fails', async () => {
    const error = new Error('Failed to fetch models');
    mockModelService.getModels.mockRejectedValue(error);
    const { result } = renderHook(() => useModels());

    expect(result.current).toEqual(initialState);

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current).toEqual(expectLoadedState([], error));
    expect(mockModelService.getModels).toHaveBeenCalledTimes(1);
  });

  it('should convert non-Error exceptions to Error', async () => {
    mockModelService.getModels.mockRejectedValue('Network error');
    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current).toEqual(expectLoadedState([], new Error('Failed to fetch models')));
    expect(mockModelService.getModels).toHaveBeenCalledTimes(1);
  });

  it('should only fetch once on mount', async () => {
    mockModelService.getModels.mockResolvedValue(mockModels);
    const { result, rerender } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    rerender();

    expect(result.current).toEqual(expectLoadedState(mockModels));
    expect(mockModelService.getModels).toHaveBeenCalledTimes(1);
  });

  it('should handle empty models array', async () => {
    mockModelService.getModels.mockResolvedValue([]);
    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current).toEqual(expectLoadedState([]));
  });

  it('should handle large number of models', async () => {
    const largeModelArray = Array.from({ length: 100 }, (_, index) => ({
      value: `model-${index}`,
      label: `Model ${index}`,
      displayName: `Model ${index}`,
      namespace: 'default',
      service: `service-${index}`,
    }));

    mockModelService.getModels.mockResolvedValue(largeModelArray);
    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current).toEqual(expectLoadedState(largeModelArray));
    expect(result.current.models).toHaveLength(100);
  });

  it('should handle models with special characters', async () => {
    const modelsWithSpecialChars: ModelOption[] = [
      {
        value: 'model-with-dashes',
        label: 'Model with dashes',
        displayName: 'Model with dashes',
        namespace: 'my-namespace',
        service: 'my-service',
      },
      {
        value: 'model_with_underscores',
        label: 'Model with underscores',
        displayName: 'Model with underscores',
        namespace: 'my_namespace',
        service: 'my_service',
      },
    ];

    mockModelService.getModels.mockResolvedValue(modelsWithSpecialChars);
    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current).toEqual(expectLoadedState(modelsWithSpecialChars));
  });

  it('should handle concurrent calls gracefully', async () => {
    mockModelService.getModels.mockResolvedValue(mockModels);

    const { result: result1 } = renderHook(() => useModels());
    const { result: result2 } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result1.current.loaded).toBe(true);
      expect(result2.current.loaded).toBe(true);
    });

    expect(result1.current).toEqual(expectLoadedState(mockModels));
    expect(result2.current).toEqual(expectLoadedState(mockModels));
    expect(mockModelService.getModels).toHaveBeenCalledTimes(2);
  });
});
