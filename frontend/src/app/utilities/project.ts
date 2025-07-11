// Mock for useDashboardNamespace hook
export const useDashboardNamespace = (): { dashboardNamespace: string } => ({
  dashboardNamespace: 'opendatahub',
});

// Mock for KnownLabels constant
export const KnownLabels = {
  MODEL_SERVING_PROJECT: 'opendatahub.io/modelserving',
} as const;
