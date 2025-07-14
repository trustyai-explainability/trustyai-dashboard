import React from 'react';
import { LMEvalKind } from '~/concepts/k8s/utils';

// TODO: Replace with actual golang API call when backend is ready
// The golang API should provide an endpoint like GET /api/v1/evaluations/{name}

type FetchStateObject<T> = {
  data: T;
  loaded: boolean;
  error?: Error;
};

// Simple mock function - replace with actual golang API call
const getModelEvaluationResult = async (evaluationName: string): Promise<LMEvalKind> => {
  // TODO: Replace with actual fetch to golang API endpoint
  // Example: fetch(`/api/v1/evaluations/${evaluationName}`)

  // Simulate API delay
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 1000);
  });

  // Import and return mock data
  const { mockLMEvalResults } = await import('../../mockApi/lmEvalResults');
  const mockResult = mockLMEvalResults.find(
    (result: LMEvalKind) => result.metadata.name === evaluationName,
  );

  if (!mockResult) {
    throw new Error(`Evaluation result not found: ${evaluationName}`);
  }

  return mockResult;
};

const useLMEvalResult = (
  evaluationName: string | undefined,
): FetchStateObject<LMEvalKind | null> => {
  const [data, setData] = React.useState<LMEvalKind | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  React.useEffect(() => {
    if (!evaluationName) {
      setData(null);
      setLoaded(true);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoaded(false);
        setError(undefined);
        const result = await getModelEvaluationResult(evaluationName);
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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [evaluationName]);

  return { data, loaded, error };
};

export default useLMEvalResult;
