# TrustyAI Dashboard Proxy Configuration

This document explains how to configure and use the proxy system that separates development mode from production in the TrustyAI Dashboard micro frontend.

## Overview

The TrustyAI Dashboard uses a proxy configuration to seamlessly switch between different environments:

- **Development Mode**: Uses mock data and local BFF
- **Production Mode**: Uses real cluster data and OAuth proxy
- **Test Mode**: Uses mock data for testing

## Environment Configuration

The environment configuration is handled by `src/config/environment.ts` which automatically detects the environment based on `NODE_ENV` and applies the appropriate settings:

### Development Mode

- **NODE_ENV**: `development`
- **API Base URL**: `/api/v1` (proxied through webpack dev server)
- **BFF URL**: `http://localhost:8080`
- **Default User**: `dev-user@example.com`
- **Auth Method**: `mock`
- **Mock Data**: Enabled
- **Debug Logging**: Enabled

### Production Mode

- **NODE_ENV**: `production`
- **API Base URL**: `/api/v1` (direct to BFF)
- **BFF URL**: `/api/v1`
- **Auth Method**: `oauth_proxy`
- **Mock Data**: Disabled
- **Debug Logging**: Disabled

## Available Scripts

### Development Scripts

```bash
# Start development server with mock data (default)
npm run start:dev

# Start development server with mock data (explicit)
npm run start:dev:mock

# Start development server with real cluster data
npm run start:dev:real

# Start production server
npm run start:prod
```

### Environment Variables

You can override the default configuration using environment variables:

```bash
# Set custom BFF URL
export BFF_URL=http://localhost:8080

# Set custom user ID for development
export DEV_USER_ID=your-username

# Start with custom configuration
BFF_URL=http://localhost:8080 DEV_USER_ID=your-username npm run start:dev
```

## Webpack Proxy Configuration

The webpack development server includes a proxy configuration that automatically routes API calls to the BFF:

```javascript
// webpack.dev.js
proxy: {
  // Proxy API calls to the BFF
  '/api': {
    target: process.env.BFF_URL || 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    // Add kubeflow-userid header for development
    onProxyReq: (proxyReq, req, res) => {
      if (process.env.DEV_USER_ID) {
        proxyReq.setHeader('kubeflow-userid', process.env.DEV_USER_ID);
      }
    },
  },
  // Proxy health check endpoint
  '/healthcheck': {
    target: process.env.BFF_URL || 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
  },
}
```

## Authentication Methods

### 1. Mock Authentication (Development)

- **Use case**: Local development and testing
- **Configuration**: `REACT_APP_AUTH_METHOD=mock`
- **Headers**: Automatically adds `kubeflow-userid` header
- **Data**: Uses mock data from the BFF

### 2. Internal Authentication (Development with Real Cluster)

- **Use case**: Development with real Kubernetes cluster
- **Configuration**: `REACT_APP_AUTH_METHOD=internal`
- **Headers**: Requires `kubeflow-userid` header
- **Data**: Uses real cluster data

### 3. OAuth Proxy Authentication (Production)

- **Use case**: Production deployment with OAuth proxy
- **Configuration**: `REACT_APP_AUTH_METHOD=oauth_proxy`
- **Headers**: Uses `X-forward-access-token` from OAuth proxy
- **Data**: Uses real cluster data

## Usage Examples

### 1. Development with Mock Data

```bash
# Start BFF in mock mode
cd ../bff
go run ./cmd --auth-method=mock --allowed-origins=http://localhost:9000

# Start frontend with mock data
cd ../frontend
npm run start:dev:mock
```

### 2. Development with Real Cluster

```bash
# Start BFF with internal authentication
cd ../bff
go run ./cmd --auth-method=internal --allowed-origins=http://localhost:9000

# Start frontend with real cluster data
cd ../frontend
npm run start:dev:real
```

### 3. Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Configuration

The API configuration automatically adapts based on the environment:

```typescript
// src/config/environment.ts
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
```

## Testing the Configuration

### Test API Endpoints

```bash
# Test health check
curl http://localhost:9000/healthcheck

# Test namespaces (with kubeflow-userid header)
curl -H "kubeflow-userid: dev-user@example.com" http://localhost:9000/api/v1/namespaces

# Test user info
curl -H "kubeflow-userid: dev-user@example.com" http://localhost:9000/api/v1/user

# Test evaluations
curl -H "kubeflow-userid: dev-user@example.com" http://localhost:9000/api/v1/evaluations
```

### Verify Proxy Configuration

1. **Check webpack dev server logs** for proxy requests
2. **Verify BFF is running** on the configured port
3. **Check network tab** in browser dev tools for API calls
4. **Verify headers** are being sent correctly

## Troubleshooting

### Common Issues

1. **BFF not running**: Ensure the BFF is started before the frontend
2. **CORS errors**: Check `allowed-origins` configuration in BFF
3. **Authentication errors**: Verify `kubeflow-userid` header is being sent
4. **Proxy not working**: Check webpack dev server configuration

### Debug Mode

Enable debug logging by setting:

```bash
export REACT_APP_ENABLE_DEBUG_LOGGING=true
```

This will show detailed logs about API calls and proxy configuration.

## Cleanup

To stop all development processes:

```bash
# Kill all webpack and Go processes
pkill -f "webpack serve"
pkill -f "go run"

# Or use specific ports
lsof -ti:8080 | xargs kill -9  # Kill BFF
lsof -ti:9000 | xargs kill -9  # Kill frontend
```

## Migration Guide

### From Old Configuration

If you were previously using hardcoded URLs:

1. **Old way**:

   ```typescript
   const API_BASE = 'http://localhost:8080/api/v1';
   ```

2. **New way**:
   ```typescript
   import { getApiBaseUrl } from '~/config/environment';
   const API_BASE = getApiBaseUrl();
   ```

### Environment Variables

Update your environment variables to use the new configuration system:

```bash
# Old
REACT_APP_API_URL=http://localhost:8080

# New
BFF_URL=http://localhost:8080
DEV_USER_ID=your-username
```
