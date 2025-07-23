package kubernetes

import (
	"context"
	"log/slog"
	"time"

	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// MockKubernetesClient provides a mock implementation of KubernetesClientInterface
// for local development without requiring a real Kubernetes cluster
type MockKubernetesClient struct {
	Logger *slog.Logger
}

// NewMockKubernetesClient creates a new mock Kubernetes client
func NewMockKubernetesClient(logger *slog.Logger) KubernetesClientInterface {
	return &MockKubernetesClient{
		Logger: logger,
	}
}

func (m *MockKubernetesClient) GetServiceNames(ctx context.Context, namespace string) ([]string, error) {
	// Return mock service names
	return []string{"trustyai-service", "model-registry-service"}, nil
}

func (m *MockKubernetesClient) GetServiceDetailsByName(ctx context.Context, namespace, serviceName string) (ServiceDetails, error) {
	// Return mock service details
	return ServiceDetails{
		Name:        serviceName,
		DisplayName: serviceName,
		Description: "Mock service for development",
		ClusterIP:   "10.0.0.1",
		HTTPPort:    8080,
	}, nil
}

func (m *MockKubernetesClient) GetServiceDetails(ctx context.Context, namespace string) ([]ServiceDetails, error) {
	// Return mock service details
	return []ServiceDetails{
		{
			Name:        "trustyai-service",
			DisplayName: "TrustyAI Service",
			Description: "Mock TrustyAI service for development",
			ClusterIP:   "10.0.0.1",
			HTTPPort:    8080,
		},
		{
			Name:        "model-registry-service",
			DisplayName: "Model Registry Service",
			Description: "Mock model registry service for development",
			ClusterIP:   "10.0.0.2",
			HTTPPort:    8081,
		},
	}, nil
}

func (m *MockKubernetesClient) GetModelServingServices(ctx context.Context, namespace string) ([]ServiceDetails, error) {
	// Return mock model serving services based on namespace
	mockServices := map[string][]ServiceDetails{
		"project-1": {
			{
				Name:        "llama2-7b-service",
				DisplayName: "Llama 2 7B Chat Model",
				Description: "Model serving service for Llama 2 7B Chat",
				ClusterIP:   "10.1.0.10",
				HTTPPort:    8080,
			},
		},
		"project-2": {
			{
				Name:        "gpt-3.5-proxy",
				DisplayName: "GPT-3.5 Turbo Proxy",
				Description: "OpenAI GPT-3.5 proxy service",
				ClusterIP:   "10.1.0.20",
				HTTPPort:    8080,
			},
		},
		"ds-project-3": {
			{
				Name:        "model-registry",
				DisplayName: "Model Registry",
				Description: "Centralized model registry service",
				ClusterIP:   "10.1.0.30",
				HTTPPort:    8080,
			},
			{
				Name:        "triton-inference-server",
				DisplayName: "NVIDIA Triton Server",
				Description: "High-performance inference server",
				ClusterIP:   "10.1.0.31",
				HTTPPort:    8000,
			},
		},
		"default": {
			{
				Name:        "ollama-service",
				DisplayName: "Ollama Local Models",
				Description: "Local Ollama model serving",
				ClusterIP:   "10.1.0.40",
				HTTPPort:    11434,
			},
		},
	}

	if services, exists := mockServices[namespace]; exists {
		m.Logger.Info("Mock: Retrieved model serving services",
			"namespace", namespace,
			"count", len(services))
		return services, nil
	}

	// Return empty list for unknown namespaces
	return []ServiceDetails{}, nil
}

func (m *MockKubernetesClient) GetNamespaces(ctx context.Context, identity *RequestIdentity) ([]corev1.Namespace, error) {
	// Return mock namespaces that the user has access to
	mockNamespaces := []corev1.Namespace{
		{
			ObjectMeta: metav1.ObjectMeta{
				Name: "project-1",
				Annotations: map[string]string{
					"openshift.io/display-name": "Project 1",
					"openshift.io/description":  "First test project",
				},
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{
				Name: "project-2",
				Annotations: map[string]string{
					"openshift.io/display-name": "Project 2",
					"openshift.io/description":  "Second test project",
				},
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{
				Name: "ds-project-3",
				Annotations: map[string]string{
					"openshift.io/display-name": "Data Science Project",
					"openshift.io/description":  "Data science project with model evaluations",
				},
			},
		},
	}

	// Filter namespaces based on user identity (simulate RBAC)
	if identity != nil && identity.UserID != "" {
		// In mock mode, allow access to all namespaces for any authenticated user
		return mockNamespaces, nil
	}

	return []corev1.Namespace{}, nil
}

func (m *MockKubernetesClient) CanListServicesInNamespace(ctx context.Context, identity *RequestIdentity, namespace string) (bool, error) {
	// In mock mode, allow all operations
	return true, nil
}

func (m *MockKubernetesClient) CanAccessServiceInNamespace(ctx context.Context, identity *RequestIdentity, namespace, serviceName string) (bool, error) {
	// In mock mode, allow all operations
	return true, nil
}

func (m *MockKubernetesClient) CreateLMEval(ctx context.Context, identity *RequestIdentity, namespace string, lmEval *models.LMEvalKind) (*models.LMEvalKind, error) {
	// Create a mock LMEval with some default values
	createdLMEval := *lmEval
	createdLMEval.Metadata.CreationTimestamp = time.Now()
	createdLMEval.Status = &models.LMEvalStatus{
		State:   "Pending",
		Message: "Mock evaluation created successfully",
		Reason:  "EvaluationPending",
	}

	m.Logger.Info("Mock: Created LMEval",
		"name", lmEval.Metadata.Name,
		"namespace", namespace,
		"user", identity.UserID)

	return &createdLMEval, nil
}

func (m *MockKubernetesClient) GetLMEval(ctx context.Context, identity *RequestIdentity, namespace, name string) (*models.LMEvalKind, error) {
	// Define all mock evaluations with results
	allMockItems := map[string]models.LMEvalKind{
		"llama-eval-completed": {
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "llama-eval-completed",
				Namespace:         "project-1",
				CreationTimestamp: time.Now().Add(-2 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Llama Model Evaluation - Completed",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "llama2-7b-chat",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"hellaswag", "arc_easy"},
				},
				AllowCodeExecution: false,
				AllowOnline:        true,
				BatchSize:          "8",
			},
			Status: &models.LMEvalStatus{
				State:   "Complete",
				Message: "Evaluation completed successfully",
				Results: `{"results":{"hellaswag":{"acc,none":0.85,"acc_norm,none":0.75},"arc_easy":{"acc,none":0.82,"acc_norm,none":0.80}}}`,
			},
		},
		"eval-1": {
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "eval-1",
				Namespace:         "ds-project-3",
				CreationTimestamp: time.Now().Add(-2 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Evaluation 1",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "llama2-7b-chat",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"hellaswag", "arc_easy"},
				},
				AllowCodeExecution: false,
				AllowOnline:        true,
				BatchSize:          "8",
			},
			Status: &models.LMEvalStatus{
				State:   "Complete",
				Message: "Evaluation completed successfully",
				Results: `{"results":{"hellaswag":{"acc,none":0.87,"acc_norm,none":0.77},"arc_easy":{"acc,none":0.82,"acc_norm,none":0.80}}}`,
			},
		},
	}

	// Try to find the specific evaluation
	if eval, exists := allMockItems[name]; exists && eval.Metadata.Namespace == namespace {
		m.Logger.Info("Mock: Retrieved LMEval",
			"name", name,
			"namespace", namespace,
			"user", identity.UserID)
		return &eval, nil
	}

	// Fallback to generic mock if not found
	mockLMEval := &models.LMEvalKind{
		APIVersion: "trustyai.opendatahub.io/v1alpha1",
		Kind:       "LMEval",
		Metadata: models.LMEvalMetadata{
			Name:              name,
			Namespace:         namespace,
			CreationTimestamp: time.Now().Add(-time.Hour),
			Annotations: map[string]string{
				"opendatahub.io/display-name": name,
			},
		},
		Spec: models.LMEvalSpec{
			Model: "llama2-7b-chat",
			TaskList: models.LMEvalTaskList{
				TaskNames: []string{"hellaswag", "arc_easy"},
			},
			AllowCodeExecution: false,
			AllowOnline:        true,
			BatchSize:          "8",
			LogSamples:         true,
		},
		Status: &models.LMEvalStatus{
			State:   "Complete",
			Message: "Mock evaluation completed successfully",
			Reason:  "EvaluationComplete",
		},
	}

	m.Logger.Info("Mock: Retrieved LMEval (fallback)",
		"name", name,
		"namespace", namespace,
		"user", identity.UserID)

	return mockLMEval, nil
}

func (m *MockKubernetesClient) ListLMEvals(ctx context.Context, identity *RequestIdentity, namespace string) (*models.LMEvalList, error) {
	// Define all mock evaluations
	allMockItems := []models.LMEvalKind{
		{
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "llama-eval-completed",
				Namespace:         "project-1",
				CreationTimestamp: time.Now().Add(-2 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Llama Model Evaluation - Completed",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "llama2-7b-chat",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"hellaswag", "arc_easy"},
				},
				AllowCodeExecution: false,
				AllowOnline:        true,
				BatchSize:          "8",
			},
			Status: &models.LMEvalStatus{
				State:   "Complete",
				Message: "Evaluation completed successfully",
				Results: `{"results":{"hellaswag":{"acc,none":0.85,"acc_norm,none":0.75},"arc_easy":{"acc,none":0.82,"acc_norm,none":0.80}}}`,
			},
		},
		{
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "mistral-eval-running",
				Namespace:         "project-2",
				CreationTimestamp: time.Now().Add(-1 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Mistral 7B Benchmark - In Progress",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "mistral-7b-instruct",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"mmlu", "gsm8k"},
				},
				AllowCodeExecution: true,
				AllowOnline:        false,
				BatchSize:          "16",
			},
			Status: &models.LMEvalStatus{
				State:   "Running",
				Message: "Evaluation in progress",
			},
		},
		{
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "eval-1",
				Namespace:         "ds-project-3",
				CreationTimestamp: time.Now().Add(-2 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Evaluation 1",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "llama2-7b-chat",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"hellaswag", "arc_easy"},
				},
				AllowCodeExecution: false,
				AllowOnline:        true,
				BatchSize:          "8",
			},
			Status: &models.LMEvalStatus{
				State:   "Complete",
				Message: "Evaluation completed successfully",
				Results: `{"results":{"hellaswag":{"acc,none":0.87,"acc_norm,none":0.77},"arc_easy":{"acc,none":0.82,"acc_norm,none":0.80}}}`,
			},
		},
		{
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "eval-2",
				Namespace:         "ds-project-3",
				CreationTimestamp: time.Now().Add(-1 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Evaluation 2",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "gpt-3.5-turbo",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"arc_easy", "mmlu"},
				},
				AllowCodeExecution: false,
				AllowOnline:        false,
				BatchSize:          "16",
			},
			Status: &models.LMEvalStatus{
				State:   "Running",
				Message: "Evaluation in progress",
			},
		},
	}

	var mockItems []models.LMEvalKind
	if namespace == "" {
		mockItems = allMockItems // All projects: return all evaluations
	} else {
		for _, item := range allMockItems {
			if item.Metadata.Namespace == namespace {
				mockItems = append(mockItems, item)
			}
		}
	}

	mockList := &models.LMEvalList{
		APIVersion: "trustyai.opendatahub.io/v1alpha1",
		Kind:       "LMEvalList",
		Metadata:   models.ListMetadata{ResourceVersion: "1"},
		Items:      mockItems,
	}

	m.Logger.Info("Mock: Listed LMEvals",
		"namespace", namespace,
		"count", len(mockItems),
		"user", identity.UserID)

	return mockList, nil
}

func (m *MockKubernetesClient) DeleteLMEval(ctx context.Context, identity *RequestIdentity, namespace, name string) error {
	// Mock successful deletion
	m.Logger.Info("Mock: Deleted LMEval",
		"name", name,
		"namespace", namespace,
		"user", identity.UserID)
	return nil
}

func (m *MockKubernetesClient) IsClusterAdmin(identity *RequestIdentity) (bool, error) {
	// In mock mode, treat admin@example.com as cluster admin
	if identity != nil && identity.UserID == "admin@example.com" {
		return true, nil
	}
	return false, nil
}

func (m *MockKubernetesClient) BearerToken() (string, error) {
	// Return a mock token
	return "mock-bearer-token", nil
}

func (m *MockKubernetesClient) GetUser(identity *RequestIdentity) (string, error) {
	// Return the user ID from the identity
	if identity != nil && identity.UserID != "" {
		return identity.UserID, nil
	}
	return "mock-user", nil
}
