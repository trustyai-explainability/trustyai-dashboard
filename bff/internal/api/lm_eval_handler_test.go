package api

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/julienschmidt/httprouter"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/config"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
	corev1 "k8s.io/api/core/v1"
)

// Mock Kubernetes client factory
type MockKubernetesClientFactory struct {
	mock.Mock
}

func (m *MockKubernetesClientFactory) GetClient(ctx context.Context) (kubernetes.KubernetesClientInterface, error) {
	args := m.Called(ctx)
	return args.Get(0).(kubernetes.KubernetesClientInterface), args.Error(1)
}

func (m *MockKubernetesClientFactory) ExtractRequestIdentity(httpHeader http.Header) (*kubernetes.RequestIdentity, error) {
	args := m.Called(httpHeader)
	return args.Get(0).(*kubernetes.RequestIdentity), args.Error(1)
}

func (m *MockKubernetesClientFactory) ValidateRequestIdentity(identity *kubernetes.RequestIdentity) error {
	args := m.Called(identity)
	return args.Error(0)
}

// Mock Kubernetes client
type MockKubernetesClient struct {
	mock.Mock
}

func (m *MockKubernetesClient) GetServiceNames(ctx context.Context, namespace string) ([]string, error) {
	args := m.Called(ctx, namespace)
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockKubernetesClient) GetServiceDetailsByName(ctx context.Context, namespace, serviceName string) (kubernetes.ServiceDetails, error) {
	args := m.Called(ctx, namespace, serviceName)
	return args.Get(0).(kubernetes.ServiceDetails), args.Error(1)
}

func (m *MockKubernetesClient) GetServiceDetails(ctx context.Context, namespace string) ([]kubernetes.ServiceDetails, error) {
	args := m.Called(ctx, namespace)
	return args.Get(0).([]kubernetes.ServiceDetails), args.Error(1)
}

func (m *MockKubernetesClient) GetModelServingServices(ctx context.Context, namespace string) ([]kubernetes.ServiceDetails, error) {
	args := m.Called(ctx, namespace)
	return args.Get(0).([]kubernetes.ServiceDetails), args.Error(1)
}

func (m *MockKubernetesClient) GetNamespaces(ctx context.Context, identity *kubernetes.RequestIdentity) ([]corev1.Namespace, error) {
	args := m.Called(ctx, identity)
	return args.Get(0).([]corev1.Namespace), args.Error(1)
}

func (m *MockKubernetesClient) CanListServicesInNamespace(ctx context.Context, identity *kubernetes.RequestIdentity, namespace string) (bool, error) {
	args := m.Called(ctx, identity, namespace)
	return args.Bool(0), args.Error(1)
}

func (m *MockKubernetesClient) CanAccessServiceInNamespace(ctx context.Context, identity *kubernetes.RequestIdentity, namespace, serviceName string) (bool, error) {
	args := m.Called(ctx, identity, namespace, serviceName)
	return args.Bool(0), args.Error(1)
}

func (m *MockKubernetesClient) CreateLMEval(ctx context.Context, identity *kubernetes.RequestIdentity, namespace string, lmEval *models.LMEvalKind) (*models.LMEvalKind, error) {
	args := m.Called(ctx, identity, namespace, lmEval)
	return args.Get(0).(*models.LMEvalKind), args.Error(1)
}

func (m *MockKubernetesClient) GetLMEval(ctx context.Context, identity *kubernetes.RequestIdentity, namespace, name string) (*models.LMEvalKind, error) {
	args := m.Called(ctx, identity, namespace, name)
	return args.Get(0).(*models.LMEvalKind), args.Error(1)
}

func (m *MockKubernetesClient) ListLMEvals(ctx context.Context, identity *kubernetes.RequestIdentity, namespace string) (*models.LMEvalList, error) {
	args := m.Called(ctx, identity, namespace)
	return args.Get(0).(*models.LMEvalList), args.Error(1)
}

func (m *MockKubernetesClient) DeleteLMEval(ctx context.Context, identity *kubernetes.RequestIdentity, namespace, name string) error {
	args := m.Called(ctx, identity, namespace, name)
	return args.Error(0)
}

func (m *MockKubernetesClient) CreateLMEvalJob(ctx context.Context, identity *kubernetes.RequestIdentity, namespace string, lmEvalJob *models.LMEvalJobKind) (*models.LMEvalJobKind, error) {
	args := m.Called(ctx, identity, namespace, lmEvalJob)
	return args.Get(0).(*models.LMEvalJobKind), args.Error(1)
}

func (m *MockKubernetesClient) GetLMEvalJob(ctx context.Context, identity *kubernetes.RequestIdentity, namespace, name string) (*models.LMEvalJobKind, error) {
	args := m.Called(ctx, identity, namespace, name)
	return args.Get(0).(*models.LMEvalJobKind), args.Error(1)
}

func (m *MockKubernetesClient) ListLMEvalJobs(ctx context.Context, identity *kubernetes.RequestIdentity, namespace string) (*models.LMEvalJobList, error) {
	args := m.Called(ctx, identity, namespace)
	return args.Get(0).(*models.LMEvalJobList), args.Error(1)
}

func (m *MockKubernetesClient) DeleteLMEvalJob(ctx context.Context, identity *kubernetes.RequestIdentity, namespace, name string) error {
	args := m.Called(ctx, identity, namespace, name)
	return args.Error(0)
}

func (m *MockKubernetesClient) IsClusterAdmin(identity *kubernetes.RequestIdentity) (bool, error) {
	args := m.Called(identity)
	return args.Bool(0), args.Error(1)
}

func (m *MockKubernetesClient) BearerToken() (string, error) {
	args := m.Called()
	return args.String(0), args.Error(1)
}

func (m *MockKubernetesClient) GetUser(identity *kubernetes.RequestIdentity) (string, error) {
	args := m.Called(identity)
	return args.String(0), args.Error(1)
}

func TestCreateLMEvalHandler(t *testing.T) {
	// Setup
	mockFactory := &MockKubernetesClientFactory{}
	mockClient := &MockKubernetesClient{}

	app := &App{
		config:                  config.EnvConfig{},
		logger:                  nil, // Will be set by test
		kubernetesClientFactory: mockFactory,
	}

	// Test data
	createRequest := models.LMEvalCreateRequest{
		EvaluationName: "test-evaluation",
		K8sName:        "test-evaluation",
		ModelType:      "test-model",
		Model: models.LMEvalModelConfig{
			Name: "test-model",
		},
		Tasks:           []string{"hellaswag"},
		AllowRemoteCode: false,
		AllowOnline:     true,
		BatchSize:       "8",
	}

	expectedLMEvalJob := &models.LMEvalJobKind{
		APIVersion: "trustyai.opendatahub.io/v1alpha1",
		Kind:       "LMEvalJob",
		Metadata: models.LMEvalJobMetadata{
			Name:      "test-evaluation",
			Namespace: "test-namespace",
			Annotations: map[string]string{
				"opendatahub.io/display-name": "test-evaluation",
			},
		},
		Spec: models.LMEvalJobSpec{
			AllowCodeExecution: false,
			AllowOnline:        true,
			BatchSize:          "8",
			LogSamples:         true,
			Model:              "test-model",
			ModelArgs: []models.LMEvalJobModelArg{
				{Name: "model", Value: "test-model"},
			},
			TaskList: models.LMEvalJobTaskList{
				TaskNames: []string{"hellaswag"},
			},
			Outputs: &models.LMEvalJobOutputs{
				PVCManaged: &models.LMEvalJobPVCManaged{
					Size: "100Mi",
				},
			},
		},
	}

	// Setup expectations
	mockFactory.On("GetClient", mock.Anything).Return(mockClient, nil)
	mockClient.On("CreateLMEvalJob", mock.Anything, mock.Anything, "test-namespace", mock.Anything).Return(expectedLMEvalJob, nil)

	// Create request
	requestBody, _ := json.Marshal(createRequest)
	req := httptest.NewRequest("POST", "/api/v1/evaluations?namespace=test-namespace", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	// Add identity to context
	identity := &kubernetes.RequestIdentity{UserID: "test-user"}
	ctx := context.WithValue(req.Context(), constants.RequestIdentityKey, identity)
	req = req.WithContext(ctx)

	w := httptest.NewRecorder()
	params := httprouter.Params{}

	// Execute
	app.CreateLMEvalHandler(w, req, params)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)

	var response LMEvalJobEnvelope
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotNil(t, response.Data)
	assert.Equal(t, "test-evaluation", response.Data.Metadata.Name)
	assert.Equal(t, "test-namespace", response.Data.Metadata.Namespace)

	mockFactory.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}

func TestListLMEvalsHandler(t *testing.T) {
	// Setup
	mockFactory := &MockKubernetesClientFactory{}
	mockClient := &MockKubernetesClient{}

	app := &App{
		config:                  config.EnvConfig{},
		logger:                  nil,
		kubernetesClientFactory: mockFactory,
	}

	// Test data
	expectedList := &models.LMEvalJobList{
		APIVersion: "trustyai.opendatahub.io/v1alpha1",
		Kind:       "LMEvalJobList",
		Metadata:   models.ListMetadata{ResourceVersion: "1"},
		Items: []models.LMEvalJobKind{
			{
				APIVersion: "trustyai.opendatahub.io/v1alpha1",
				Kind:       "LMEvalJob",
				Metadata: models.LMEvalJobMetadata{
					Name:      "test-eval-1",
					Namespace: "test-namespace",
				},
				Spec: models.LMEvalJobSpec{
					Model: "test-model",
					TaskList: models.LMEvalJobTaskList{
						TaskNames: []string{"hellaswag"},
					},
				},
			},
		},
	}

	// Setup expectations
	mockFactory.On("GetClient", mock.Anything).Return(mockClient, nil)
	mockClient.On("ListLMEvalJobs", mock.Anything, mock.Anything, "test-namespace").Return(expectedList, nil)

	// Create request
	req := httptest.NewRequest("GET", "/api/v1/evaluations?namespace=test-namespace", nil)

	// Add identity to context
	identity := &kubernetes.RequestIdentity{UserID: "test-user"}
	ctx := context.WithValue(req.Context(), constants.RequestIdentityKey, identity)
	req = req.WithContext(ctx)

	w := httptest.NewRecorder()
	params := httprouter.Params{}

	// Execute
	app.ListLMEvalsHandler(w, req, params)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response LMEvalListEnvelope
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotNil(t, response.Data)
	assert.Len(t, response.Data.Items, 1)
	assert.Equal(t, "test-eval-1", response.Data.Items[0].Metadata.Name)

	mockFactory.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}
