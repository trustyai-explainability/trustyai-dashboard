import { useState, useEffect } from 'react';
import { CustomWatchK8sResult, ProjectKind } from '~/app/types';
import { NamespaceService } from '~/app/api';

/**
 * Hook to fetch projects/namespaces from the API
 * Uses the real BFF backend instead of mock data
 */
export const useProjects = (): CustomWatchK8sResult<ProjectKind[]> => {
  const [data, setData] = useState<ProjectKind[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    setLoaded(false);
    setLoadError(undefined);

    const fetchData = async () => {
      try {
        const namespaceNames = await NamespaceService.getNamespaces();

        // Convert namespace names to ProjectKind objects
        const projects: ProjectKind[] = namespaceNames.map((name) => ({
          apiVersion: 'project.openshift.io/v1',
          kind: 'Project',
          metadata: {
            name,
            annotations: {
              'openshift.io/display-name': name,
              'openshift.io/description': `Project ${name}`,
            },
            labels: {
              'opendatahub.io/dashboard': 'true',
            },
          },
          status: {
            phase: 'Active',
          },
        }));

        setData(projects);
        setLoaded(true);
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Unknown error'));
        setLoaded(true);
      }
    };

    fetchData();
  }, []);

  return [data, loaded, loadError];
};
