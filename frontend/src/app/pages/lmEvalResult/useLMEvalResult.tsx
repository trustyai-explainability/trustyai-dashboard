import React from 'react';
import { LMEvalKind } from '~/concepts/k8s/utils';

// TODO: Replace with actual golang API call when backend is ready
// The golang API should provide an endpoint like GET /api/v1/evaluations/{name}/namespaces/{namespace}/results

type FetchStateObject<T> = {
  data: T;
  loaded: boolean;
  error?: Error;
};

// Simple mock useFetch hook - replace with proper implementation when utilities are ready
const useFetch = <T,>(fetchFn: () => Promise<T>, initialData: T): FetchStateObject<T> => {
  const [data, setData] = React.useState<T>(initialData);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoaded(false);
        setError(undefined);
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
          setLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoaded(true);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchFn]);

  return { data, loaded, error };
};

// Mock function - replace with actual golang API call
const getModelEvaluationResult = async (
  evaluationName: string,
  namespace: string,
): Promise<LMEvalKind> => {
  // TODO: Replace with actual fetch to golang API endpoint
  // Example: fetch(`/api/v1/evaluations/${evaluationName}`) or
  // fetch(`/api/v1/evaluations/${evaluationName}/namespaces/${namespace}/results`)

  // Simulate API delay
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 1000);
  });

  // For now, import and return mock data
  const { mockLMEvalResults } = await import('../../mockApi/lmEvalResults');

  // First try to find exact match with namespace
  let mockResult = mockLMEvalResults.find(
    (result: LMEvalKind) =>
      result.metadata.name === evaluationName && result.metadata.namespace === namespace,
  );

  // If not found and namespace is 'default', try to find by name only (any namespace)
  if (!mockResult && namespace === 'default') {
    mockResult = mockLMEvalResults.find(
      (result: LMEvalKind) => result.metadata.name === evaluationName,
    );
  }

  if (!mockResult) {
    throw new Error(`Evaluation result not found: ${evaluationName}`);
  }

  return mockResult;
};

const useLMEvalResult = (
  evaluationName: string | undefined,
  namespace?: string | undefined,
): FetchStateObject<LMEvalKind | null> => {
  const getLMEvalResult = React.useCallback(() => {
    if (!evaluationName) {
      return Promise.resolve(null);
    }
    // Use provided namespace or default to 'default'
    const targetNamespace = namespace || 'default';
    return getModelEvaluationResult(evaluationName, targetNamespace);
  }, [evaluationName, namespace]);

  return useFetch<LMEvalKind | null>(getLMEvalResult, null);
};

export default useLMEvalResult;
