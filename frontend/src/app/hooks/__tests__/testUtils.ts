import { ModelOption } from '~/app/hooks/useModels';

export const mockModels: ModelOption[] = [
  {
    value: 'model-1',
    label: 'Model 1',
    displayName: 'Model One',
    namespace: 'default',
    service: 'service-1',
  },
  {
    value: 'model-2',
    label: 'Model 2',
    displayName: 'Model Two',
    namespace: 'default',
    service: 'service-2',
  },
];

export const initialState = {
  models: [],
  loaded: false,
  error: undefined,
};

export const expectLoadedState = (
  models: ModelOption[],
  error?: Error,
): {
  models: ModelOption[];
  loaded: boolean;
  error: Error | undefined;
} => ({
  models,
  loaded: true,
  error,
});
