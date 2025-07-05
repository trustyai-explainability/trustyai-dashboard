import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Gets description from K8s resource metadata annotations
 */
export const getDescriptionFromK8sResource = (resource: K8sResourceCommon): string =>
  resource.metadata?.annotations?.['openshift.io/description'] || '';

/**
 * Gets display name from K8s resource metadata annotations
 */
export const getDisplayNameFromK8sResource = (resource: K8sResourceCommon): string =>
  resource.metadata?.annotations?.['openshift.io/display-name'] || resource.metadata?.name || '';

/**
 * Checks if resource is a DSG (Data Science Group) resource
 */
export const isK8sDSGResource = (resource: unknown): resource is K8sResourceCommon =>
  typeof resource === 'object' && resource !== null && 'metadata' in resource;

/**
 * Validates K8s resource name against RFC 1123 subdomain rules
 */
export const isValidK8sName = (name: string, regexp?: RegExp): boolean => {
  if (regexp) {
    return regexp.test(name);
  }

  // RFC 1123 subdomain rules
  const k8sNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
  return k8sNameRegex.test(name);
};

export type AdditionalCriteriaForTranslation = {
  maxLength?: number;
  safeK8sPrefix?: string;
  staticPrefix?: boolean;
};

/**
 * Translates display name to valid K8s resource name
 */
export const translateDisplayNameForK8s = (
  displayName: string,
  additionalCriteria: AdditionalCriteriaForTranslation = {},
): string => {
  const { maxLength = 253, safeK8sPrefix = '', staticPrefix = false } = additionalCriteria;

  // If displayName is empty, return empty string (don't default to 'unnamed')
  if (!displayName.trim()) {
    return '';
  }

  // Convert to lowercase and replace invalid characters with hyphens
  let k8sName = displayName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Handle prefix
  let prefix = '';
  if (staticPrefix && safeK8sPrefix) {
    prefix = safeK8sPrefix;
  } else if (safeK8sPrefix && /^[0-9]/.test(k8sName)) {
    // Add prefix if name starts with number
    prefix = safeK8sPrefix;
  }

  // Calculate available length for the name part
  const availableLength = maxLength - prefix.length;

  // Truncate if necessary
  if (k8sName.length > availableLength) {
    k8sName = k8sName.substring(0, availableLength);
    // Remove trailing hyphen if truncation caused one
    k8sName = k8sName.replace(/-$/, '');
  }

  // Ensure it's not empty and doesn't start/end with hyphen (only if we had a non-empty input)
  if (!k8sName || k8sName === '-') {
    k8sName = 'unnamed';
  }

  return prefix + k8sName;
};
