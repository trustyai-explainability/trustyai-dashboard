import React from 'react';

export interface SecurityConfig {
  data: {
    'lmes-allow-online': string;
    'lmes-allow-code-execution': string;
  };
}

type FetchStateObject<T> = {
  data: T;
  loaded: boolean;
  error?: Error;
};

// Real configuration - fetches from API or uses environment variables
const useTrustyAIConfigMap = (): FetchStateObject<SecurityConfig | null> => {
  const [config, setConfig] = React.useState<SecurityConfig | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoaded(false);
        setError(undefined);

        // Try to fetch from API first
        try {
          const response = await fetch('/api/v1/config/security');
          if (response.ok) {
            const apiConfig = await response.json();
            setConfig(apiConfig);
            setLoaded(true);
            return;
          }
        } catch {
          // API not available, fall back to environment variables
        }

        // Fallback to environment variables or defaults
        const fallbackConfig: SecurityConfig = {
          data: {
            'lmes-allow-online': process.env.REACT_APP_LMES_ALLOW_ONLINE || 'true',
            'lmes-allow-code-execution': process.env.REACT_APP_LMES_ALLOW_CODE_EXECUTION || 'true',
          },
        };

        setConfig(fallbackConfig);
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load configuration'));
        setLoaded(true);
      }
    };

    fetchConfig();
  }, []);

  return {
    data: config,
    loaded,
    error,
  };
};

export default useTrustyAIConfigMap;
