// Export all API modules
export { k8sApi } from './k8s';
export type { LMEvalList, LMEvalCreateRequest } from './k8s';
export { LMEvalService, NamespaceService, UserService } from './service';
export { lmEvalService, namespaceService, userService } from './service';

// Default export for convenience
export { default as api } from './service';
