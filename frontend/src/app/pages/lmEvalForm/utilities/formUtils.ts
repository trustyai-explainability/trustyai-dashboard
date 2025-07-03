import { isK8sNameDescriptionDataValid } from '~/app/components/K8sNameDescriptionField/utils';
import { K8sNameDescriptionFieldData } from '~/app/components/K8sNameDescriptionField/types';
import { LmEvalFormData, LmModelArgument } from './types';

export const isFilledLmEvalFormData = (
  data: LmEvalFormData,
  k8sNameData?: K8sNameDescriptionFieldData,
): boolean => {
  const basicValidation =
    data.tasks.length > 0 &&
    !!data.model.name &&
    !!data.model.url &&
    !!data.evaluationName &&
    !!data.modelType &&
    !!data.model.tokenizer;

  // If k8sNameData is provided, validate it as well
  if (k8sNameData) {
    return basicValidation && isK8sNameDescriptionDataValid(k8sNameData);
  }

  return basicValidation;
};

export const convertModelArgs = (modelArgs: LmModelArgument): { name: string; value: string }[] => [
  { name: 'model', value: modelArgs.name },
  { name: 'base_url', value: modelArgs.url },
  { name: 'num_concurrent', value: '1' },
  { name: 'max_retries', value: '3' },
  { name: 'tokenized_requests', value: modelArgs.tokenizedRequest },
  { name: 'tokenizer', value: modelArgs.tokenizer },
];
