// Environment configuration for the TrustyAI Dashboard
export interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  bffUrl: string;

  // Authentication
  devUserId: string;
  authMethod: 'mock' | 'internal' | 'user_token' | 'oauth_proxy';

  // Development settings
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Feature flags
  enableMockData: boolean;
  enableDebugLogging: boolean;
}

// Helper function to detect if running in module federation mode
export const isModuleFederationMode = (): boolean =>
  // Check if we're running in a module federation context
  // This can be detected by checking if we're loaded by the ODH dashboard
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  window.location.port === '4010';

// Default development configuration
const developmentConfig: EnvironmentConfig = {
  apiBaseUrl: '/api/v1', // Use proxy in development
  bffUrl: process.env.BFF_URL || 'http://localhost:8080',
  devUserId: process.env.DEV_USER_ID || 'dev-user@example.com',
  authMethod: 'mock',
  isDevelopment: true,
  isProduction: false,
  isTest: false,
  enableMockData: true,
  enableDebugLogging: true,
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  apiBaseUrl: isModuleFederationMode()
    ? 'http://localhost:8080/api/v1' // Direct BFF URL when in module federation
    : '/api/v1', // Use proxy when standalone
  bffUrl: '/api/v1',
  devUserId: '',
  authMethod: 'oauth_proxy', // Use OAuth proxy in production
  isDevelopment: false,
  isProduction: true,
  isTest: false,
  enableMockData: false,
  enableDebugLogging: false,
};

// Test configuration
const testConfig: EnvironmentConfig = {
  apiBaseUrl: '/api/v1',
  bffUrl: process.env.BFF_URL || 'http://localhost:8080',
  devUserId: process.env.TEST_USER_ID || 'test-user@example.com',
  authMethod: 'mock',
  isDevelopment: false,
  isProduction: false,
  isTest: true,
  enableMockData: true,
  enableDebugLogging: false,
};

// Get the appropriate configuration based on environment
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  switch (nodeEnv) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

// Export the current configuration
export const config = getEnvironmentConfig();

// Helper functions
export const isDevelopment = (): boolean => config.isDevelopment;
export const isProduction = (): boolean => config.isProduction;
export const isTest = (): boolean => config.isTest;

// API URL helpers
export const getApiBaseUrl = (): string => config.apiBaseUrl;
export const getBffUrl = (): string => config.bffUrl;

// Authentication helpers
export const getDevUserId = (): string => config.devUserId;
export const getAuthMethod = (): string => config.authMethod;

// Feature flag helpers
export const shouldUseMockData = (): boolean => config.enableMockData;
export const shouldEnableDebugLogging = (): boolean => config.enableDebugLogging;
