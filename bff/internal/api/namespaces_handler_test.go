package api

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"log/slog"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/config"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetNamespacesHandler(t *testing.T) {
	// Setup
	mockFactory := &MockKubernetesClientFactory{}
	mockClient := &MockKubernetesClient{}

	app := &App{
		config:                  config.EnvConfig{},
		logger:                  slog.Default(),
		kubernetesClientFactory: mockFactory,
	}

	// Test data - mock namespaces
	mockNamespaces := []corev1.Namespace{
		{
			ObjectMeta: metav1.ObjectMeta{
				Name: "project-1",
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{
				Name: "project-2",
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{
				Name: "ds-project-3",
			},
		},
	}

	// Setup expectations
	mockFactory.On("GetClient", mock.Anything).Return(mockClient, nil)
	mockClient.On("GetNamespaces", mock.Anything, mock.Anything).Return(mockNamespaces, nil)

	// Create request
	req := httptest.NewRequest("GET", "/api/v1/namespaces", nil)

	// Add identity to context
	identity := &kubernetes.RequestIdentity{UserID: "test-user"}
	ctx := context.WithValue(req.Context(), constants.RequestIdentityKey, identity)
	req = req.WithContext(ctx)

	w := httptest.NewRecorder()

	// Execute
	app.GetNamespacesHandler(w, req, nil)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response NamespacesEnvelope
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotNil(t, response.Data)
	assert.Len(t, response.Data, 3)

	// Check namespace names
	namespaceNames := make([]string, len(response.Data))
	for i, ns := range response.Data {
		namespaceNames[i] = ns.Name
	}

	assert.Contains(t, namespaceNames, "project-1")
	assert.Contains(t, namespaceNames, "project-2")
	assert.Contains(t, namespaceNames, "ds-project-3")

	mockFactory.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}

func TestGetNamespacesHandler_NoIdentity(t *testing.T) {
	// Setup
	mockFactory := &MockKubernetesClientFactory{}

	app := &App{
		config:                  config.EnvConfig{},
		logger:                  slog.Default(),
		kubernetesClientFactory: mockFactory,
	}

	// Create request without identity
	req := httptest.NewRequest("GET", "/api/v1/namespaces", nil)
	w := httptest.NewRecorder()

	// Execute
	app.GetNamespacesHandler(w, req, nil)

	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response ErrorEnvelope
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotNil(t, response.Error)
	assert.Contains(t, response.Error.Message, "missing RequestIdentity")
}

func TestGetNamespacesHandler_ClientError(t *testing.T) {
	// Setup
	mockFactory := &MockKubernetesClientFactory{}
	mockClient := &MockKubernetesClient{}

	app := &App{
		config:                  config.EnvConfig{},
		logger:                  slog.Default(),
		kubernetesClientFactory: mockFactory,
	}

	// Setup expectations - simulate client error
	mockFactory.On("GetClient", mock.Anything).Return(mockClient, nil)
	mockClient.On("GetNamespaces", mock.Anything, mock.Anything).Return([]corev1.Namespace{}, assert.AnError)

	// Create request
	req := httptest.NewRequest("GET", "/api/v1/namespaces", nil)

	// Add identity to context
	identity := &kubernetes.RequestIdentity{UserID: "test-user"}
	ctx := context.WithValue(req.Context(), constants.RequestIdentityKey, identity)
	req = req.WithContext(ctx)

	w := httptest.NewRecorder()

	// Execute
	app.GetNamespacesHandler(w, req, nil)

	// Assert
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response ErrorEnvelope
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotNil(t, response.Error)

	mockFactory.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}
