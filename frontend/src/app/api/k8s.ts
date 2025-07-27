import { getApiBaseUrl, getDevUserId, isModuleFederationMode } from '~/config/environment';

export interface LMEvalKind {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
  };
  spec: {
    model: string;
    taskList: {
      taskNames: string[];
    };
    allowCodeExecution?: boolean;
    allowOnline?: boolean;
    batchSize?: string;
    logSamples?: boolean;
  };
  status?: {
    state?: string;
    message?: string;
    results?: string;
  };
}

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

// API base configuration using environment config
const API_BASE = getApiBaseUrl();

// Default headers for kubeflow authentication
const getDefaultHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add kubeflow-userid header for authentication
  // In module federation mode, we need to add this header manually
  // In standalone mode, the webpack proxy adds it automatically
  if (isModuleFederationMode()) {
    const userId = getDevUserId();
    if (userId) {
      headers['kubeflow-userid'] = userId;
    }
  }

  return headers;
};

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

  async delete(endpoint: string): Promise<void> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...getDefaultHeaders(),
    };

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }
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
    apiClient.delete(
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
