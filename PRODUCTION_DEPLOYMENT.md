# Production Deployment Guide

## Overview

This guide explains how to deploy the TrustyAI Dashboard in production.

## Architecture

### Development vs Production

| Component          | Development                   | Production                 |
| ------------------ | ----------------------------- | -------------------------- |
| **Frontend**       | Webpack dev server with proxy | Static files served by BFF |
| **Authentication** | `kubeflow-userid` header      | OAuth proxy tokens         |
| **API Calls**      | Proxy forwards to BFF         | Direct calls to BFF        |
| **Build**          | Hot reload with webpack       | Optimized static build     |

## Prerequisites

1. **Kubernetes Cluster** (OpenShift, EKS, GKE, etc.)
2. **OAuth Proxy** configured for authentication
3. **Service Account** with proper RBAC permissions
4. **Domain** for your application

## Deployment Options

### Option 1: Docker (Recommended)

```bash
# Build the container
docker build -t trustyai-dashboard .

# Run the container
docker run -p 8080:8080 \
  -e AUTH_METHOD=oauth_proxy \
  -e ALLOWED_ORIGINS=https://your-domain.com \
  -e LOG_LEVEL=info \
  trustyai-dashboard
```

### Option 2: Binary + Static Files

#### Step 1: Build Frontend

```bash
cd frontend
./scripts/build-prod.sh
```

#### Step 2: Build BFF

```bash
cd bff
./scripts/deploy-prod.sh
```

#### Step 3: Copy Static Files

```bash
# Copy frontend build to BFF static directory
cp -r frontend/dist/* bff/static/
```

#### Step 4: Run BFF

```bash
cd bff
./main \
  --auth-method=oauth_proxy \
  --allowed-origins=https://your-domain.com \
  --static-assets-dir=./static \
  --port=8080
```

## Configuration

### Environment Variables

| Variable          | Description           | Default       | Required |
| ----------------- | --------------------- | ------------- | -------- |
| `AUTH_METHOD`     | Authentication method | `oauth_proxy` | Yes      |
| `ALLOWED_ORIGINS` | CORS allowed origins  | -             | Yes      |
| `LOG_LEVEL`       | Logging level         | `info`        | No       |
| `PORT`            | Server port           | `8080`        | No       |

### BFF Command Line Options

```bash
./main \
  --auth-method=oauth_proxy \
  --allowed-origins=https://your-domain.com \
  --static-assets-dir=./static \
  --port=8080 \
  --log-level=info
```

## Kubernetes Deployment

### Service Account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: trustyai-dashboard
  namespace: your-namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: trustyai-dashboard
rules:
  - apiGroups: [""]
    resources: ["namespaces"]
    verbs: ["get", "list"]
  - apiGroups: ["trustyai.opendatahub.io"]
    resources: ["*"]
    verbs: ["get", "list", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: trustyai-dashboard
subjects:
  - kind: ServiceAccount
    name: trustyai-dashboard
    namespace: your-namespace
roleRef:
  kind: ClusterRole
  name: trustyai-dashboard
  apiGroup: rbac.authorization.k8s.io
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trustyai-dashboard
  namespace: your-namespace
spec:
  replicas: 2
  selector:
    matchLabels:
      app: trustyai-dashboard
  template:
    metadata:
      labels:
        app: trustyai-dashboard
    spec:
      serviceAccountName: trustyai-dashboard
      containers:
        - name: trustyai-dashboard
          image: trustyai-dashboard:latest
          ports:
            - containerPort: 8080
          env:
            - name: AUTH_METHOD
              value: "oauth_proxy"
            - name: ALLOWED_ORIGINS
              value: "https://your-domain.com"
            - name: LOG_LEVEL
              value: "info"
```

## OAuth Proxy Configuration

The BFF expects OAuth proxy to inject tokens via the `X-forward-access-token` header.

### Example OAuth Proxy Sidecar

```yaml
- name: oauth-proxy
  image: openshift/oauth-proxy:latest
  args:
    - --provider=openshift
    - --client-id=trustyai-dashboard
    - --client-secret=your-client-secret
    - --cookie-secret=your-cookie-secret
    - --upstream=http://localhost:8080
    - --http-address=0.0.0.0:8443
    - --https-address=
    - --tls-cert=/etc/tls/private/tls.crt
    - --tls-key=/etc/tls/private/tls.key
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS**: Configure allowed origins properly
3. **RBAC**: Use least privilege principle for service accounts
4. **Secrets**: Store sensitive data in Kubernetes secrets
5. **Network Policies**: Restrict network access as needed

## Monitoring

### Health Check

```bash
curl https://your-domain.com/healthcheck
```

### Metrics

The BFF exposes basic metrics at `/metrics` (if configured).

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**

   - Check OAuth proxy configuration
   - Verify service account permissions
   - Check BFF logs

2. **CORS Errors**

   - Verify `--allowed-origins` configuration
   - Check browser console for details

3. **Authentication Failures**
   - Verify OAuth proxy is running
   - Check token injection in headers
   - Verify RBAC permissions

### Logs

```bash
# View BFF logs
kubectl logs -f deployment/trustyai-dashboard

# View OAuth proxy logs
kubectl logs -f deployment/trustyai-dashboard -c oauth-proxy
```

## Migration from Development

1. **Remove Development Headers**: No more `kubeflow-userid` header
2. **Update API Calls**: Use relative paths instead of proxy
3. **Configure OAuth**: Set up OAuth proxy authentication
4. **Update CORS**: Configure production domains
5. **Test Authentication**: Verify OAuth flow works

## Support

For issues or questions:

- Check the logs for error details
- Verify configuration matches this guide
- Ensure all prerequisites are met
