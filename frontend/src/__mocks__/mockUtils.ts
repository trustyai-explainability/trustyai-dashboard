import { K8sResourceCommon } from 'mod-arch-shared/dist/types';
import { genRandomChars } from 'mod-arch-shared/dist/utilities/string';

export const genUID = (name: string): string => `test-uid_${name}_${genRandomChars()}`;

/**
 * Clones the resource and increments its metadata.resourceVersion.
 */
export const incrementResourceVersion = <T extends K8sResourceCommon>(resource: T): T => {
  const clone = structuredClone(resource);
  clone.metadata = {
    ...clone.metadata,
    resourceVersion: `${Number(clone.metadata?.resourceVersion) + 1 || 1}`,
  };
  return clone;
};
