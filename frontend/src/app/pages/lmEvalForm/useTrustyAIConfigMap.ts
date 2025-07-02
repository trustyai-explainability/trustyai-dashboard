import React from 'react';

// Define a simple config type to replace k8s ConfigMap
type SecurityConfig = {
  data?: {
    'lmes-allow-online'?: string;
    'lmes-allow-code-execution'?: string;
  };
};

type FetchStateObject<T> = {
  data: T;
  loaded: boolean;
  error?: Error;
};

// Mock configuration - replace with your actual config source
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  data: {
    'lmes-allow-online': 'true', // Allow online access by default
    'lmes-allow-code-execution': 'true', // Allow remote code execution by default
  },
};

const useTrustyAIConfigMap = (): FetchStateObject<SecurityConfig | null> => {
  // You can replace this with:
  // - Environment variables: process.env.LMES_ALLOW_ONLINE
  // - API call to your BFF: fetch('/api/config')
  // - Static configuration file
  // - Browser localStorage/sessionStorage

  const [config] = React.useState<SecurityConfig>(DEFAULT_SECURITY_CONFIG);
  const [loaded] = React.useState(true);

  return {
    data: config,
    loaded,
    error: undefined,
  };
};

export default useTrustyAIConfigMap;
