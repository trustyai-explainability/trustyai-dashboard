import { K8sNameDescriptionFieldData } from '~/app/components/K8sNameDescriptionField/types';
import { RecursivePartial } from '~/typeHelpers';

export const mockK8sNameDescriptionFieldData = (
  override: RecursivePartial<K8sNameDescriptionFieldData> = {},
): K8sNameDescriptionFieldData => ({
  name: override.name ?? '',
  description: override.description ?? '',
  k8sName: {
    value: override.k8sName?.value ?? '',
    state: {
      immutable: false,
      invalidCharacters: false,
      invalidLength: false,
      maxLength: 253,
      touched: false,
      regexp: undefined,
      invalidCharsMessage: undefined,
      safePrefix: undefined,
      staticPrefix: undefined,
      ...override.k8sName?.state,
    },
  },
});
