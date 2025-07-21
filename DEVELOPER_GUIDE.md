# TrustyAI Dashboard Developer Guide

## Architecture Overview

This dashboard follows the ODH (Open Data Hub) architecture pattern as mandated by the new motor architecture:

- **Frontend**: React with PatternFly components
- **BFF**: Go service handling all Kubernetes interactions
- **Authentication**: OAuth proxy integration via `X-forward-access-token`
- **API**: OpenAPI specification for all endpoints

## Development Workflow

### 1. API-First Development

1. Define API specifications in `bff/openapi.yaml`
2. Implement mock endpoints in BFF for frontend development
3. Build frontend components using mock data
4. Integrate with live Kubernetes cluster

### 2. Authentication Methods

The BFF supports multiple authentication methods:

- **`oauth_proxy`**: Production mode with OAuth proxy sidecar (default for ODH)
- **`user_token`**: Development with Bearer tokens
- **`internal`**: Service account authentication
- **`mock`**: Local development without cluster

### 3. Running Locally

#### BFF Development

```bash
# Run with mock authentication (no cluster needed)
go run cmd/main.go --auth-method=mock

# Run with user token authentication
go run cmd/main.go --auth-method=user_token --auth-token-header=Authorization

# Run with OAuth proxy simulation
go run cmd/main.go --auth-method=oauth_proxy --oauth-proxy-token-header=X-forward-access-token
```

#### Frontend Development

```bash
cd frontend
npm install
npm start
```

The frontend will connect to the BFF running on `localhost:8080`.

## Authentication Flow

### OAuth Proxy Integration (Production)

1. **OAuth Proxy Sidecar**: Injects `X-forward-access-token` header with Kubernetes access token
2. **BFF**: Extracts token and creates Kubernetes client
3. **Authorization**: Performs SubjectAccessReview (SAR) checks for each operation
4. **Response**: Returns data or 403 Forbidden based on permissions

### Development Authentication

For local development, you can:

1. **Use mock mode**: No authentication required, uses predefined data
2. **Use Bearer tokens**: Set `Authorization: Bearer <token>` header
3. **Simulate OAuth proxy**: Set `X-forward-access-token: <token>` header

## API Endpoints

All API endpoints are documented in `bff/openapi.yaml` and follow REST conventions:

- `GET /api/v1/user` - Get current user information
- `GET /api/v1/namespaces` - List accessible namespaces
- `GET /api/v1/evaluations?namespace=<ns>` - List model evaluations
- `POST /api/v1/evaluations` - Create new evaluation
- `GET /api/v1/evaluations/{name}` - Get specific evaluation
- `DELETE /api/v1/evaluations/{name}` - Delete evaluation
- `GET /api/v1/models` - List available models

## Deployment Modes

### 1. Standalone Mode

Independent deployment with its own OAuth proxy and BFF service.

### 2. ODH Integrated Mode

Embedded in ODH dashboard as a module federation component.

### 3. Federated Mode

Module federation with other applications sharing common components.

## Namespace Handling

The dashboard uses shared libraries for namespace selection and syncing across deployment modes:

- **Standalone**: User selects namespace from available list
- **ODH Integrated**: Namespace context provided by ODH dashboard
- **Federated**: Namespace synchronized across federated applications

## Code Organization

### Frontend Structure

```
frontend/src/
├── app/
│   ├── api/           # API client code
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   └── hooks/         # Custom React hooks
├── concepts/          # Domain concepts (projects, k8s)
└── utilities/         # Utility functions
```

### BFF Structure

```
bff/
├── cmd/main.go        # Application entry point
├── internal/
│   ├── api/           # HTTP handlers and middleware
│   ├── config/        # Configuration management
│   ├── integrations/  # External service integrations
│   └── models/        # Data models
├── openapi.yaml       # API specification
└── static/            # Frontend static assets
```

## Shared Components

The dashboard exports reusable components for the ODH monorepo:

- **K8sNameDescriptionField**: Kubernetes resource name/description input
- **ProjectSelector**: Namespace/project selection component
- **FilterToolbar**: Data filtering and search
- **DeleteModal**: Confirmation dialogs

## Testing

### Unit Tests

```bash
# Frontend tests
cd frontend && npm test

# BFF tests
cd bff && go test ./...
```

### Integration Tests

```bash
# Run with mock authentication
go run cmd/main.go --auth-method=mock
# Then run frontend tests against mock BFF
```

### E2E Tests

```bash
cd frontend && npm run cypress:open
```

## Environment Variables

### BFF Configuration

- `AUTH_METHOD`: Authentication method (`oauth_proxy`, `user_token`, `internal`, `mock`)
- `OAUTH_PROXY_TOKEN_HEADER`: Header for OAuth proxy tokens (default: `X-forward-access-token`)
- `AUTH_TOKEN_HEADER`: Header for Bearer tokens (default: `Authorization`)
- `PORT`: BFF server port (default: `8080`)
- `LOG_LEVEL`: Logging level (default: `DEBUG`)

### Frontend Configuration

- `REACT_APP_API_BASE`: API base URL (default: `/api/v1` for production, `http://localhost:8080/api/v1` for development)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure OAuth proxy headers are included in CORS configuration
2. **Authentication Failures**: Check that the correct auth method is configured
3. **Permission Denied**: Verify user has appropriate RBAC permissions in the namespace
4. **API Connection**: Ensure BFF is running and accessible from frontend

### Debug Mode

Enable debug logging:

```bash
go run cmd/main.go --log-level=DEBUG
```

This will show detailed request/response information and authentication flow.

## Migration to ODH Monorepo

When migrating to the ODH monorepo:

1. **Package Structure**: Create package under `packages/trustyai-dashboard/`
2. **Shared Components**: Export reusable components for other teams
3. **Module Federation**: Configure for runtime integration
4. **Extensions**: Declare navigation items and routes for ODH dashboard

## Contributing

1. Follow the API-first development workflow
2. Update OpenAPI specification for new endpoints
3. Add tests for new functionality
4. Update this guide for significant changes
5. Ensure compatibility with all deployment modes
