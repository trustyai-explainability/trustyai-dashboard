import { useState, useEffect } from 'react';
import { CustomWatchK8sResult, LMEvalKind } from '~/app/types';
import { LMEvalService } from '~/app/api';

/**
 * Hook to fetch LMEval resources from the API
 * Uses the real BFF backend instead of mock data
 */
export const useLMEvalJob = (namespace: string): CustomWatchK8sResult<LMEvalKind[]> => {
  const [data, setData] = useState<LMEvalKind[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

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

    fetchData();
  }, [namespace]);

  return [data, loaded, loadError];
};
