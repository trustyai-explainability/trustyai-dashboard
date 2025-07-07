import { LmModelArgument } from './types';

export type ModelOption = {
  label: string;
  value: string;
  namespace: string;
  displayName: string;
  service: string;
};

export type ModelTypeOption = {
  key: string;
  label: string;
  endpoint?: string;
};

export const handleModelSelection = (
  selectedModelName: string,
  modelOptions: ModelOption[],
  currentModel: LmModelArgument,
  currentModelType: string,
  findOptionForKey: (key: string) => ModelTypeOption | undefined,
): {
  deployedModelName: string;
  model: LmModelArgument;
} => {
  const selectedModelOption = modelOptions.find(
    (option: ModelOption) => option.value === selectedModelName,
  );

  if (!selectedModelOption) {
    return {
      deployedModelName: selectedModelName,
      model: currentModel,
    };
  }

  const baseUrl = selectedModelOption.service || '';

  let finalUrl = baseUrl;
  if (currentModelType && baseUrl) {
    const modelOption = findOptionForKey(currentModelType);
    const endpoint = modelOption?.endpoint ?? '';
    finalUrl = `${baseUrl}${endpoint}`;
  }

  return {
    deployedModelName: selectedModelName,
    model: {
      ...currentModel,
      name: selectedModelOption.displayName,
      url: finalUrl,
    },
  };
};

export const handleModelTypeSelection = (
  modelType: string,
  currentModel: LmModelArgument,
  findOptionForKey: (key: string) => ModelTypeOption | undefined,
): {
  modelType: string;
  model: LmModelArgument;
} => {
  if (!currentModel.url) {
    return {
      modelType,
      model: currentModel,
    };
  }

  const baseUrl = currentModel.url.replace(/\/v1\/(chat\/)?completions/, '');
  const modelOption = findOptionForKey(modelType);
  const endpoint = modelOption?.endpoint ?? '';

  return {
    modelType,
    model: {
      ...currentModel,
      url: `${baseUrl}${endpoint}`,
    },
  };
};
