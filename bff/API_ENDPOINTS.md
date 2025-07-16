# LMEval API Endpoints

This document describes the new LMEval (Model Evaluation) API endpoints that have been implemented in the BFF (Backend for Frontend).

## Overview

The LMEval API provides CRUD operations for managing model evaluation resources in Kubernetes. These endpoints integrate with the TrustyAI LMEval Custom Resource Definition (CRD) to manage model evaluation jobs.

## Base URL

All endpoints are prefixed with `/api/v1/evaluations`

## Authentication

All endpoints require authentication. The authentication method is determined by the `auth-method` configuration:

- `internal`: Uses service account credentials (default)
- `user_token`: Uses Bearer token authentication

## Endpoints

### 1. List Evaluations

**GET** `/api/v1/evaluations`

Lists all LMEval resources, optionally filtered by namespace.

#### Query Parameters

- `namespace` (optional): Filter evaluations by namespace. If not provided, lists across all namespaces.

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v1/evaluations?namespace=my-project" \
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
          "name": "my-evaluation",
          "namespace": "my-project",
          "annotations": {
            "opendatahub.io/display-name": "My Model Evaluation"
          }
        },
        "spec": {
          "model": "llama2-7b-chat",
          "taskList": {
            "taskNames": ["hellaswag", "arc_easy"]
          },
          "allowCodeExecution": false,
          "allowOnline": true,
          "batchSize": "8"
        },
        "status": {
          "state": "Complete",
          "message": "Evaluation completed successfully"
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
curl -X POST "http://localhost:8080/api/v1/evaluations?namespace=my-project" \
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
      "namespace": "my-project",
      "annotations": {
        "opendatahub.io/display-name": "My Model Evaluation"
      }
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
curl -X GET "http://localhost:8080/api/v1/evaluations/my-model-evaluation?namespace=my-project" \
  -H "kubeflow-userid: user@example.com"
```

#### Example Response

```json
{
  "data": {
    "apiVersion": "trustyai.opendatahub.io/v1alpha1",
    "kind": "LMEval",
    "metadata": {
      "name": "my-model-evaluation",
      "namespace": "my-project"
    },
    "spec": {
      "model": "llama2-7b-chat",
      "taskList": {
        "taskNames": ["hellaswag"]
      }
    },
    "status": {
      "state": "Complete",
      "message": "Evaluation completed successfully",
      "results": "{\"hellaswag\": {\"accuracy\": 0.85}}"
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
curl -X DELETE "http://localhost:8080/api/v1/evaluations/my-model-evaluation?namespace=my-project" \
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

## Kubernetes Integration

The API integrates with Kubernetes using:

1. **Dynamic Client**: Uses `k8s.io/client-go/dynamic` to interact with the LMEval CRD
2. **Group Version Resource**: `trustyai.opendatahub.io/v1alpha1/lmevals`
3. **Authentication**: Supports both service account and user token authentication
4. **Authorization**: Validates user permissions using Subject Access Reviews (SAR)

## Implementation Details

### Models

- `LMEvalKind`: Main resource type
- `LMEvalCreateRequest`: Request body for creation
- `LMEvalList`: List response wrapper

### Handlers

- `CreateLMEvalHandler`: Handles POST requests
- `GetLMEvalHandler`: Handles GET requests for individual resources
- `ListLMEvalsHandler`: Handles GET requests for lists
- `DeleteLMEvalHandler`: Handles DELETE requests

### Kubernetes Client

The `KubernetesClientInterface` has been extended with LMEval-specific methods:

- `CreateLMEval()`
- `GetLMEval()`
- `ListLMEvals()`
- `DeleteLMEval()`

## Testing

Comprehensive unit tests are included in `lm_eval_handler_test.go` that verify:

- Request validation
- Response formatting
- Error handling
- Mock Kubernetes client integration

Run tests with:

```bash
make test
```
