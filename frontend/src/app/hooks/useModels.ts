import { useState, useEffect } from 'react';
import { ModelService } from '~/app/api/service';

export interface ModelOption {
  value: string;
  label: string;
  displayName: string;
  namespace: string;
  service: string;
}

export const useModels = (): {
  models: ModelOption[];
  loaded: boolean;
  error: Error | undefined;
} => {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoaded(false);
        setError(undefined);
        const modelData = await ModelService.getModels();
        setModels(modelData);
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch models'));
        setLoaded(true);
      }
    };

    fetchModels();
  }, []);

  return { models, loaded, error };
};
