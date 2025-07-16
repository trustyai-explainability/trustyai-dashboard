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
	// Return a mock LMEval
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

	m.Logger.Info("Mock: Retrieved LMEval",
		"name", name,
		"namespace", namespace,
		"user", identity.UserID)

	return mockLMEval, nil
}

func (m *MockKubernetesClient) ListLMEvals(ctx context.Context, identity *RequestIdentity, namespace string) (*models.LMEvalList, error) {
	// Return a mock list of LMEvals
	mockItems := []models.LMEvalKind{
		{
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "eval-1",
				Namespace:         namespace,
				CreationTimestamp: time.Now().Add(-2 * time.Hour),
				Annotations: map[string]string{
					"opendatahub.io/display-name": "Evaluation 1",
				},
			},
			Spec: models.LMEvalSpec{
				Model: "llama2-7b-chat",
				TaskList: models.LMEvalTaskList{
					TaskNames: []string{"hellaswag"},
				},
				AllowCodeExecution: false,
				AllowOnline:        true,
				BatchSize:          "8",
			},
			Status: &models.LMEvalStatus{
				State:   "Complete",
				Message: "Evaluation completed successfully",
			},
		},
		{
			APIVersion: "trustyai.opendatahub.io/v1alpha1",
			Kind:       "LMEval",
			Metadata: models.LMEvalMetadata{
				Name:              "eval-2",
				Namespace:         namespace,
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

	// Filter by namespace if specified
	if namespace != "" {
		filteredItems := make([]models.LMEvalKind, 0)
		for _, item := range mockItems {
			if item.Metadata.Namespace == namespace {
				filteredItems = append(filteredItems, item)
			}
		}
		mockItems = filteredItems
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
