import { CustomWatchK8sResult, ProjectKind } from '~/app/types';
import { mockProjectsK8sList } from '~/__mocks__/mockProject';

/**
 * Mock implementation of useProjects hook
 * Returns mock project data with simulated loading states
 */
export const useProjects = (): CustomWatchK8sResult<ProjectKind[]> => [
  mockProjectsK8sList().items,
  true,
  undefined,
];
