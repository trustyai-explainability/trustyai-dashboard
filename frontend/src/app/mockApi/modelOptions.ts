import { ModelService } from '~/app/api/service';

export interface ModelOption {
  value: string;
  label: string;
  displayName: string;
  namespace: string;
  service: string;
}

// Function to get models from the real API
export const getModelOptions = async (): Promise<ModelOption[]> => {
  try {
    return await ModelService.getModels();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch models from API, falling back to defaults:', error);
    // Fallback to default models if API fails
    return [
      {
        value: 'llama2-7b-chat',
        label: 'Llama 2 7B Chat',
        displayName: 'Llama 2 7B Chat',
        namespace: 'default',
        service: 'https://api.example.com/llama2-7b-chat',
      },
      {
        value: 'gpt-3.5-turbo',
        label: 'GPT-3.5 Turbo',
        displayName: 'GPT-3.5 Turbo',
        namespace: 'default',
        service: 'https://api.openai.com/v1',
      },
    ];
  }
};

// For backward compatibility, export a default array that will be replaced
export const modelOptions: ModelOption[] = [
  {
    value: 'llama2-7b-chat',
    label: 'Llama 2 7B Chat',
    displayName: 'Llama 2 7B Chat',
    namespace: 'default',
    service: 'https://api.example.com/llama2-7b-chat',
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    displayName: 'GPT-3.5 Turbo',
    namespace: 'default',
    service: 'https://api.openai.com/v1',
  },
];
