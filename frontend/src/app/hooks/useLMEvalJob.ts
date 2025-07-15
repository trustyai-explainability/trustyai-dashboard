import { useState, useEffect } from 'react';
import { CustomWatchK8sResult, LMEvalKind } from '~/app/types';

/**
 * Simple mock implementation of useLMEvalJob hook
 * Returns mock data from mockApi/lmEvalResults
 */
export const useLMEvalJob = (namespace: string): CustomWatchK8sResult<LMEvalKind[]> => {
  const [data, setData] = useState<LMEvalKind[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(async () => {
      try {
        // Import the proper mock data from mockApi
        const { mockLMEvalResults } = await import('~/app/mockApi/lmEvalResults');

        const filteredData = namespace
          ? mockLMEvalResults.filter((item) => item.metadata.namespace === namespace)
          : mockLMEvalResults;

        setData(filteredData);
        setLoaded(true);
        setLoadError(undefined);
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Unknown error'));
        setLoaded(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [namespace]);

  return [data, loaded, loadError];
};
