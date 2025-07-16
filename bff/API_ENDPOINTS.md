# TrustyAI Dashboard API Documentation

This document describes the complete API endpoints implemented in the BFF (Backend for Frontend) for the TrustyAI Dashboard.

## Overview

The TrustyAI Dashboard API provides a unified interface for managing model evaluations, namespaces, and user information. The API integrates with Kubernetes to manage TrustyAI LMEval Custom Resource Definitions (CRDs) and provides a clean abstraction for the frontend.

## Base URL

All API endpoints are prefixed with `/api/v1`

## Authentication

All endpoints require authentication. The authentication method is determined by the `auth-method` configuration:

- `internal`: Uses Kubernetes service account credentials (production)
- `user_token`: Uses Bearer token authentication (production)
- `mock`: Uses mock authentication for local development

### Required Headers

- `kubeflow-userid`: User identifier (required for all endpoints)
- `Content-Type: application/json`: For POST/PUT requests

## Core Endpoints

### 1. Health Check

**GET** `/healthcheck`

Simple health check endpoint to verify the service is running.

#### Example Request

```bash
curl -X GET "http://localhost:8080/healthcheck"
```

#### Example Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### 2. User Information

**GET** `/api/v1/user`

Retrieves current user information and permissions.

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v1/user" \
  -H "kubeflow-userid: user@example.com"
```

#### Example Response

```json
{
  "data": {
    "userID": "user@example.com",
    "clusterAdmin": false
  }
}
```

### 3. Namespaces

**GET** `/api/v1/namespaces`

Lists all namespaces that the current user has access to.

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v1/namespaces" \
  -H "kubeflow-userid: user@example.com"
```

#### Example Response

```json
{
  "data": [
    {
      "name": "project-1",
      "displayName": "Project 1",
      "description": "First test project"
    },
    {
      "name": "project-2",
      "displayName": "Project 2",
      "description": "Second test project"
    },
    {
      "name": "ds-project-3",
      "displayName": "Data Science Project",
      "description": "Data science project with model evaluations"
    }
  ]
}
```

### 4. Models

**GET** `/api/v1/models`

Lists available models for evaluation.

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v1/models" \
  -H "kubeflow-userid: user@example.com"
```

#### Example Response

```json
{
  "data": [
    {
      "value": "llama2-7b-chat",
      "label": "Llama 2 7B Chat",
      "displayName": "Llama 2 7B Chat",
      "namespace": "default",
      "service": "https://api.example.com/llama2-7b-chat"
    },
    {
      "value": "gpt-3.5-turbo",
      "label": "GPT-3.5 Turbo",
      "displayName": "GPT-3.5 Turbo",
      "namespace": "default",
      "service": "https://api.openai.com/v1"
    }
  ]
}
```

## Model Evaluation Endpoints

### 1. List Evaluations

**GET** `/api/v1/evaluations`

Lists all LMEval resources, optionally filtered by namespace.

#### Query Parameters

- `namespace` (optional): Filter evaluations by namespace. If not provided, lists across all namespaces.

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v1/evaluations?namespace=project-1" \
  -H "kubeflow-userid: user@example.com"
```

#### Example Response

```json
{
  "data": {
    "apiVersion": "trustyai.opendatahub.io/v1alpha1",
    "kind": "LMEvalList",
    "metadata": {
      "resourceVersion": "12345"
    },
    "items": [
      {
        "apiVersion": "trustyai.opendatahub.io/v1alpha1",
        "kind": "LMEval",
        "metadata": {
          "name": "llama-eval-completed",
          "namespace": "project-1",
          "annotations": {
            "opendatahub.io/display-name": "Llama Model Evaluation - Completed"
          },
          "creationTimestamp": "2024-01-15T10:00:00Z"
        },
        "spec": {
          "model": "llama2-7b-chat",
          "taskList": {
            "taskNames": ["hellaswag", "arc_easy"]
          },
          "allowCodeExecution": false,
          "allowOnline": true,
          "batchSize": "8",
          "logSamples": true
        },
        "status": {
          "state": "Complete",
          "message": "Evaluation completed successfully",
          "results": "{\"results\":{\"hellaswag\":{\"acc,none\":0.85,\"acc_norm,none\":0.75},\"arc_easy\":{\"acc,none\":0.82,\"acc_norm,none\":0.80}}}"
        }
      }
    ]
  }
}
```

### 2. Create Evaluation

**POST** `/api/v1/evaluations`

Creates a new LMEval resource.

#### Query Parameters

- `namespace` (required): The namespace where the evaluation will be created.

#### Request Body

```json
{
  "evaluationName": "My Model Evaluation",
  "k8sName": "my-model-evaluation",
  "modelType": "llama2-7b-chat",
  "model": {
    "name": "llama2-7b-chat",
    "url": "https://api.example.com/v1",
    "tokenizedRequest": "False",
    "tokenizer": "hf-internal-testing/llama-tokenizer"
  },
  "tasks": ["hellaswag", "arc_easy"],
  "allowRemoteCode": false,
  "allowOnline": true,
  "batchSize": "8"
}
```

#### Example Request

```bash
curl -X POST "http://localhost:8080/api/v1/evaluations?namespace=project-1" \
  -H "Content-Type: application/json" \
  -H "kubeflow-userid: user@example.com" \
  -d '{
    "evaluationName": "My Model Evaluation",
    "k8sName": "my-model-evaluation",
    "modelType": "llama2-7b-chat",
    "model": {
      "name": "llama2-7b-chat"
    },
    "tasks": ["hellaswag"],
    "allowRemoteCode": false,
    "allowOnline": true,
    "batchSize": "8"
  }'
```

#### Example Response

```json
{
  "data": {
    "apiVersion": "trustyai.opendatahub.io/v1alpha1",
    "kind": "LMEval",
    "metadata": {
      "name": "my-model-evaluation",
      "namespace": "project-1",
      "annotations": {
        "opendatahub.io/display-name": "My Model Evaluation"
      },
      "creationTimestamp": "2024-01-15T10:00:00Z"
    },
    "spec": {
      "model": "llama2-7b-chat",
      "taskList": {
        "taskNames": ["hellaswag"]
      },
      "allowCodeExecution": false,
      "allowOnline": true,
      "batchSize": "8",
      "logSamples": true,
      "modelArgs": [
        {
          "name": "model",
          "value": "llama2-7b-chat"
        }
      ],
      "outputs": {
        "pvcManaged": {
          "size": "100Mi"
        }
      }
    },
    "status": {
      "state": "Pending",
      "message": "Evaluation created successfully",
      "reason": "EvaluationPending"
    }
  }
}
```

### 3. Get Evaluation

**GET** `/api/v1/evaluations/:name`

Retrieves a specific LMEval resource by name.

#### Path Parameters

- `name` (required): The name of the evaluation resource.

#### Query Parameters

- `namespace` (required): The namespace containing the evaluation.

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v1/evaluations/eval-1?namespace=ds-project-3" \
  -H "kubeflow-userid: user@example.com"
```

#### Example Response

```json
{
  "data": {
    "apiVersion": "trustyai.opendatahub.io/v1alpha1",
    "kind": "LMEval",
    "metadata": {
      "name": "eval-1",
      "namespace": "ds-project-3",
      "annotations": {
        "opendatahub.io/display-name": "Evaluation 1"
      },
      "creationTimestamp": "2024-01-15T10:00:00Z"
    },
    "spec": {
      "model": "llama2-7b-chat",
      "taskList": {
        "taskNames": ["hellaswag", "arc_easy"]
      },
      "allowCodeExecution": false,
      "allowOnline": true,
      "batchSize": "8",
      "logSamples": true
    },
    "status": {
      "state": "Complete",
      "message": "Evaluation completed successfully",
      "results": "{\"results\":{\"hellaswag\":{\"acc,none\":0.87,\"acc_norm,none\":0.77},\"arc_easy\":{\"acc,none\":0.82,\"acc_norm,none\":0.80}}}"
    }
  }
}
```

### 4. Delete Evaluation

**DELETE** `/api/v1/evaluations/:name`

Deletes a specific LMEval resource.

#### Path Parameters

- `name` (required): The name of the evaluation resource to delete.

#### Query Parameters

- `namespace` (required): The namespace containing the evaluation.

#### Example Request

```bash
curl -X DELETE "http://localhost:8080/api/v1/evaluations/my-model-evaluation?namespace=project-1" \
  -H "kubeflow-userid: user@example.com"
```

#### Response

Returns HTTP 204 (No Content) on successful deletion.

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:

```json
{
  "error": {
    "code": "400",
    "message": "namespace parameter is required"
  }
}
```

## Mock Mode

When running with `--auth-method=mock`, the API returns predefined mock data for local development:

### Mock Namespaces

- `project-1`: Contains "Llama Model Evaluation - Completed"
- `project-2`: Contains "Mistral 7B Benchmark - In Progress"
- `ds-project-3`: Contains "eval-1" (Complete) and "eval-2" (Running)

### Mock Evaluations

- **Completed evaluations** include realistic `results` data in JSON format
- **Running evaluations** show progress status without results
- **All projects** filter returns evaluations from all namespaces

### Mock Models

- `llama2-7b-chat`: Llama 2 7B Chat model
- `gpt-3.5-turbo`: GPT-3.5 Turbo model
- `mistral-7b-instruct`: Mistral 7B Instruct model

## Kubernetes Integration

The API integrates with Kubernetes using:

1. **Dynamic Client**: Uses `k8s.io/client-go/dynamic` to interact with the LMEval CRD
2. **Group Version Resource**: `trustyai.opendatahub.io/v1alpha1/lmevals`
3. **Authentication**: Supports service account, user token, and mock authentication
4. **Authorization**: Validates user permissions using Subject Access Reviews (SAR)

## Implementation Details

### Models

- `LMEvalKind`: Main resource type for evaluations
- `LMEvalCreateRequest`: Request body for evaluation creation
- `LMEvalList`: List response wrapper
- `ModelOption`: Available model configuration
- `Namespace`: Namespace information

### Handlers

- `CreateLMEvalHandler`: Handles POST requests for evaluation creation
- `GetLMEvalHandler`: Handles GET requests for individual evaluations
- `ListLMEvalsHandler`: Handles GET requests for evaluation lists
- `DeleteLMEvalHandler`: Handles DELETE requests for evaluations
- `GetModelsHandler`: Handles GET requests for available models
- `GetNamespacesHandler`: Handles GET requests for user namespaces
- `GetUserHandler`: Handles GET requests for user information
- `HealthCheckHandler`: Handles health check requests

### Kubernetes Client Interface

The `KubernetesClientInterface` provides these methods:

- `CreateLMEval(ctx, identity, namespace, lmEval)`
- `GetLMEval(ctx, identity, namespace, name)`
- `ListLMEvals(ctx, identity, namespace)`
- `DeleteLMEval(ctx, identity, namespace, name)`
- `GetNamespaces(ctx, identity)`
- `GetUser(identity)`
- `IsClusterAdmin(identity)`

### Mock Client

For local development, a `MockKubernetesClient` implements the same interface with predefined data, allowing full frontend testing without a Kubernetes cluster.

## Testing

Comprehensive unit tests verify:

- Request validation and parsing
- Response formatting
- Error handling
- Mock Kubernetes client integration
- Authentication and authorization

Run tests with:

```bash
cd bff
make test
```

## Development

### Running Locally

```bash
cd bff
go run ./cmd --auth-method=mock --allowed-origins=http://localhost:9000
```

### Production Deployment

```bash
cd bff
go run ./cmd --auth-method=internal --allowed-origins=https://your-frontend-domain.com
```

## CORS Configuration

The API supports CORS for frontend integration:

- Configure allowed origins via `--allowed-origins` flag
- Supports credentials for authenticated requests
- Allows standard HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Includes required headers for Kubeflow integration
