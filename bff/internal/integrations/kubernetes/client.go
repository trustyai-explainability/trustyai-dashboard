package kubernetes

import (
	"context"

	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
	corev1 "k8s.io/api/core/v1"
)

const ComponentLabelValue = "trustyai-service"

type KubernetesClientInterface interface {
	// Service discovery
	GetServiceNames(ctx context.Context, namespace string) ([]string, error)
	GetServiceDetailsByName(ctx context.Context, namespace, serviceName string) (ServiceDetails, error)
	GetServiceDetails(ctx context.Context, namespace string) ([]ServiceDetails, error)

	// Model serving service discovery
	GetModelServingServices(ctx context.Context, namespace string) ([]ServiceDetails, error)

	// Namespace access
	GetNamespaces(ctx context.Context, identity *RequestIdentity) ([]corev1.Namespace, error)

	// Permission checks (abstracted SAR/SelfSAR)
	CanListServicesInNamespace(ctx context.Context, identity *RequestIdentity, namespace string) (bool, error)
	CanAccessServiceInNamespace(ctx context.Context, identity *RequestIdentity, namespace, serviceName string) (bool, error)

	// LMEvalJob CRUD operations
	CreateLMEvalJob(ctx context.Context, identity *RequestIdentity, namespace string, lmEvalJob *models.LMEvalJobKind) (*models.LMEvalJobKind, error)
	GetLMEvalJob(ctx context.Context, identity *RequestIdentity, namespace, name string) (*models.LMEvalJobKind, error)
	ListLMEvalJobs(ctx context.Context, identity *RequestIdentity, namespace string) (*models.LMEvalJobList, error)
	DeleteLMEvalJob(ctx context.Context, identity *RequestIdentity, namespace, name string) error

	// Meta
	IsClusterAdmin(identity *RequestIdentity) (bool, error)
	BearerToken() (string, error)
	GetUser(identity *RequestIdentity) (string, error)
}
