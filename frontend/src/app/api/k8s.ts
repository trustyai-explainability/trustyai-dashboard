import { LMEvalKind } from '~/app/types';

// Define missing types that match the backend models
export interface LMEvalList {
  apiVersion: string;
  kind: string;
  metadata: {
    resourceVersion: string;
  };
  items: LMEvalKind[];
}

export interface LMEvalCreateRequest {
  evaluationName: string;
  k8sName: string;
  modelType: string;
  model: {
    name: string;
    url?: string;
    tokenizedRequest?: string;
    tokenizer?: string;
  };
  tasks: string[];
  allowRemoteCode: boolean;
  allowOnline: boolean;
  batchSize?: string;
}

// API base configuration
const API_BASE =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? 'http://localhost:8080/api/v1'
    : '/api/v1';

// Default headers for kubeflow authentication
const getDefaultHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  // For development with mock authentication, include the required header
  // In production, this will be injected by OAuth proxy
  ...(process.env.NODE_ENV === 'development' && {
    'kubeflow-userid': 'test-user@example.com',
  }),
});

// Generic API client for making requests
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...getDefaultHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE);

// Kubernetes API endpoints
export const k8sApi = {
  // Namespaces
  getNamespaces: (): Promise<{ data: Array<{ name: string }> }> =>
    apiClient.get<{ data: Array<{ name: string }> }>('/namespaces'),

  // LMEval operations
  listLMEvals: (namespace?: string): Promise<{ data: LMEvalList }> => {
    const params = namespace ? `?namespace=${encodeURIComponent(namespace)}` : '';
    return apiClient.get<{ data: LMEvalList }>(`/evaluations${params}`);
  },

  getLMEval: (namespace: string, name: string): Promise<{ data: LMEvalKind }> =>
    apiClient.get<{ data: LMEvalKind }>(
      `/evaluations/${encodeURIComponent(name)}?namespace=${encodeURIComponent(namespace)}`,
    ),

  createLMEval: (namespace: string, data: LMEvalCreateRequest): Promise<{ data: LMEvalKind }> =>
    apiClient.post<{ data: LMEvalKind }>(
      `/evaluations?namespace=${encodeURIComponent(namespace)}`,
      data,
    ),

  updateLMEval: (
    namespace: string,
    name: string,
    data: LMEvalKind,
  ): Promise<{ data: LMEvalKind }> =>
    apiClient.put<{ data: LMEvalKind }>(
      `/evaluations/${encodeURIComponent(name)}?namespace=${encodeURIComponent(namespace)}`,
      data,
    ),

  deleteLMEval: (namespace: string, name: string): Promise<void> =>
    apiClient.delete<void>(
      `/evaluations/${encodeURIComponent(name)}?namespace=${encodeURIComponent(namespace)}`,
    ),

  // Health check
  healthCheck: (): Promise<{ status: string }> => apiClient.get<{ status: string }>('/health'),

  // User info
  getUser: (): Promise<{ data: { userID: string; clusterAdmin: boolean } }> =>
    apiClient.get<{ data: { userID: string; clusterAdmin: boolean } }>('/user'),

  // Models
  getModels: (): Promise<{
    data: Array<{
      value: string;
      label: string;
      displayName: string;
      namespace: string;
      service: string;
    }>;
  }> =>
    apiClient.get<{
      data: Array<{
        value: string;
        label: string;
        displayName: string;
        namespace: string;
        service: string;
      }>;
    }>('/models'),
};

export default k8sApi;
