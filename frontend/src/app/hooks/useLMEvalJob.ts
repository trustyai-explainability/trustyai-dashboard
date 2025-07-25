import { useState, useEffect, useRef } from 'react';
import { CustomWatchK8sResult, LMEvalKind } from '~/app/types';
import { LMEvalService } from '~/app/api';

/**
 * Hook to fetch LMEval resources from the API with automatic polling
 * Uses the real BFF backend instead of mock data
 */
export const useLMEvalJob = (namespace: string): CustomWatchK8sResult<LMEvalKind[]> => {
  const [data, setData] = useState<LMEvalKind[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoaded(false);
    setLoadError(undefined);

    const fetchData = async () => {
      try {
        const evaluations = await LMEvalService.getEvaluations(namespace);
        setData(evaluations);
        setLoaded(true);
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Unknown error'));
        setLoaded(true);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling for status updates
    // Poll every 5 seconds for evaluations that are not in a final state
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 5000);

    // Cleanup interval on unmount or namespace change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [namespace]);

  return [data, loaded, loadError];
};
