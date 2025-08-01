import React from 'react';
import { LMEvalKind } from '~/concepts/k8s/utils';
import { k8sApi } from '~/app/api/k8s';

// TODO: Replace with actual golang API call when backend is ready
// The golang API should provide an endpoint like GET /api/v1/evaluations/{name}

type FetchStateObject<T> = {
  data: T;
  loaded: boolean;
  error?: Error;
};

// Real API function - uses the backend API
const getModelEvaluationResult = async (
  evaluationName: string,
  namespace: string,
): Promise<LMEvalKind> => {
  const response = await k8sApi.getLMEval(namespace, evaluationName);
  return response.data;
};

const useLMEvalResult = (
  evaluationName: string | undefined,
  namespace: string | undefined,
): FetchStateObject<LMEvalKind | null> => {
  const [data, setData] = React.useState<LMEvalKind | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!evaluationName || !namespace) {
      setData(null);
      setLoaded(true);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoaded(false);
        setError(undefined);
        const result = await getModelEvaluationResult(evaluationName, namespace);
        if (isMounted) {
          setData(result);
          setLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setData(null);
          setLoaded(true);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling for status updates
    // Poll every 3 seconds for evaluations that are not in a final state
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 3000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [evaluationName, namespace]);

  return { data, loaded, error };
};

export default useLMEvalResult;
