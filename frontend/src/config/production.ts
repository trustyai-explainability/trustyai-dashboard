// Production-specific configuration
export const productionConfig = {
  // API Configuration
  apiBaseUrl: '/api/v1', // Use relative path in production (served by BFF)
  bffUrl: '/api/v1',

  // Authentication
  authMethod: 'oauth_proxy' as const, // Use OAuth proxy in production

  // Environment flags
  isDevelopment: false,
  isProduction: true,
  isTest: false,

  // Feature flags
  enableMockData: false,
  enableDebugLogging: false,

  // CORS and security
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'https://your-domain.com',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Production environment variables
export const productionEnvVars = {
  NODE_ENV: 'production',
  AUTH_METHOD: 'oauth_proxy',
  ENABLE_MOCK_DATA: 'false',
  ENABLE_DEBUG_LOGGING: 'false',
};
