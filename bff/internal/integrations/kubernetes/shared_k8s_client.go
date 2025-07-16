package kubernetes

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type SharedClientLogic struct {
	Client kubernetes.Interface
	Logger *slog.Logger
	Token  BearerToken
}

func (kc *SharedClientLogic) GetServiceNames(sessionCtx context.Context, namespace string) ([]string, error) {
	services, err := kc.GetServiceDetails(sessionCtx, namespace)
	if err != nil {
		return nil, err
	}

	names := make([]string, 0, len(services))
	for _, svc := range services {
		names = append(names, svc.Name)
	}

	return names, nil
}

func (kc *SharedClientLogic) GetServiceDetails(sessionCtx context.Context, namespace string) ([]ServiceDetails, error) {

	if namespace == "" {
		return nil, fmt.Errorf("namespace cannot be empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	sessionLogger := sessionCtx.Value(constants.TraceLoggerKey).(*slog.Logger)

	labelSelector := fmt.Sprintf("component=%s", ComponentLabelValue)

	serviceList, err := kc.Client.CoreV1().Services(namespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to list services: %w", err)
	}

	var services []ServiceDetails

	for _, service := range serviceList.Items {
		serviceDetails, err := buildServiceDetails(&service, sessionLogger)
		if err != nil {
			sessionLogger.Warn("skipping service", "error", err)
			continue
		}
		services = append(services, *serviceDetails)

	}
	return services, nil
}

func buildServiceDetails(service *corev1.Service, logger *slog.Logger) (*ServiceDetails, error) {
	if service == nil {
		return nil, fmt.Errorf("service cannot be nil")
	}

	var httpPort int32
	hasHTTPPort := false
	for _, port := range service.Spec.Ports {
		if port.Name == "http-api" {
			httpPort = port.Port
			hasHTTPPort = true
			break
		}
	}
	if !hasHTTPPort {
		logger.Error("service missing HTTP port", "serviceName", service.Name)
		return nil, fmt.Errorf("service %q missing required 'http-api' port", service.Name)
	}

	if service.Spec.ClusterIP == "" {
		logger.Error("service missing valid ClusterIP", "serviceName", service.Name)
		return nil, fmt.Errorf("service %q missing ClusterIP", service.Name)
	}

	displayName := ""
	description := ""
	if service.Annotations != nil {
		displayName = service.Annotations["displayName"]
		description = service.Annotations["description"]
	}

	if displayName == "" {
		logger.Warn("service missing displayName annotation", "serviceName", service.Name)
	}
	if description == "" {
		logger.Warn("service missing description annotation", "serviceName", service.Name)
	}

	return &ServiceDetails{
		Name:        service.Name,
		DisplayName: displayName,
		Description: description,
		ClusterIP:   service.Spec.ClusterIP,
		HTTPPort:    httpPort,
	}, nil
}

func (kc *SharedClientLogic) GetServiceDetailsByName(sessionCtx context.Context, namespace string, serviceName string) (ServiceDetails, error) {
	if namespace == "" || serviceName == "" {
		return ServiceDetails{}, fmt.Errorf("namespace and serviceName cannot be empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	sessionLogger := sessionCtx.Value(constants.TraceLoggerKey).(*slog.Logger)

	service, err := kc.Client.CoreV1().Services(namespace).Get(ctx, serviceName, metav1.GetOptions{})
	if err != nil {
		return ServiceDetails{}, fmt.Errorf("failed to get service %q in namespace %q: %w", serviceName, namespace, err)
	}

	details, err := buildServiceDetails(service, sessionLogger)
	if err != nil {
		return ServiceDetails{}, err
	}
	return *details, nil
}

func (kc *SharedClientLogic) BearerToken() (string, error) {
	// Token is retained for follow-up calls; do not log it.
	return kc.Token.Raw(), nil
}

// LMEval CRUD operations
func (kc *SharedClientLogic) CreateLMEval(ctx context.Context, identity *RequestIdentity, namespace string, lmEval *models.LMEvalKind) (*models.LMEvalKind, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Create dynamic client for custom resources
	dynamicClient, err := dynamic.NewForConfig(&rest.Config{
		BearerToken: kc.Token.Raw(),
		Host:        kc.Client.CoreV1().RESTClient().Get().URL().Host,
		TLSClientConfig: rest.TLSClientConfig{
			Insecure: true, // For development - should be configurable
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create dynamic client: %w", err)
	}

	// Define the GVR for LMEval
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevals",
	}

	// Convert to unstructured
	unstructuredObj, err := runtime.DefaultUnstructuredConverter.ToUnstructured(lmEval)
	if err != nil {
		return nil, fmt.Errorf("failed to convert to unstructured: %w", err)
	}

	// Create the resource
	result, err := dynamicClient.Resource(gvr).Namespace(namespace).Create(ctx, &unstructured.Unstructured{Object: unstructuredObj}, metav1.CreateOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to create LMEval: %w", err)
	}

	// Convert back to LMEvalKind
	var createdLMEval models.LMEvalKind
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(result.UnstructuredContent(), &createdLMEval)
	if err != nil {
		return nil, fmt.Errorf("failed to convert from unstructured: %w", err)
	}

	return &createdLMEval, nil
}

func (kc *SharedClientLogic) GetLMEval(ctx context.Context, identity *RequestIdentity, namespace, name string) (*models.LMEvalKind, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Create dynamic client for custom resources
	dynamicClient, err := dynamic.NewForConfig(&rest.Config{
		BearerToken: kc.Token.Raw(),
		Host:        kc.Client.CoreV1().RESTClient().Get().URL().Host,
		TLSClientConfig: rest.TLSClientConfig{
			Insecure: true, // For development - should be configurable
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create dynamic client: %w", err)
	}

	// Define the GVR for LMEval
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevals",
	}

	// Get the resource
	result, err := dynamicClient.Resource(gvr).Namespace(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get LMEval: %w", err)
	}

	// Convert to LMEvalKind
	var lmEval models.LMEvalKind
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(result.UnstructuredContent(), &lmEval)
	if err != nil {
		return nil, fmt.Errorf("failed to convert from unstructured: %w", err)
	}

	return &lmEval, nil
}

func (kc *SharedClientLogic) ListLMEvals(ctx context.Context, identity *RequestIdentity, namespace string) (*models.LMEvalList, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Create dynamic client for custom resources
	dynamicClient, err := dynamic.NewForConfig(&rest.Config{
		BearerToken: kc.Token.Raw(),
		Host:        kc.Client.CoreV1().RESTClient().Get().URL().Host,
		TLSClientConfig: rest.TLSClientConfig{
			Insecure: true, // For development - should be configurable
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create dynamic client: %w", err)
	}

	// Define the GVR for LMEval
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevals",
	}

	// List the resources
	var listOptions metav1.ListOptions
	if namespace == "" {
		// List across all namespaces
		result, err := dynamicClient.Resource(gvr).List(ctx, listOptions)
		if err != nil {
			return nil, fmt.Errorf("failed to list LMEvals: %w", err)
		}
		return convertUnstructuredListToLMEvalList(result)
	} else {
		// List in specific namespace
		result, err := dynamicClient.Resource(gvr).Namespace(namespace).List(ctx, listOptions)
		if err != nil {
			return nil, fmt.Errorf("failed to list LMEvals in namespace %s: %w", namespace, err)
		}
		return convertUnstructuredListToLMEvalList(result)
	}
}

func (kc *SharedClientLogic) DeleteLMEval(ctx context.Context, identity *RequestIdentity, namespace, name string) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Create dynamic client for custom resources
	dynamicClient, err := dynamic.NewForConfig(&rest.Config{
		BearerToken: kc.Token.Raw(),
		Host:        kc.Client.CoreV1().RESTClient().Get().URL().Host,
		TLSClientConfig: rest.TLSClientConfig{
			Insecure: true, // For development - should be configurable
		},
	})
	if err != nil {
		return fmt.Errorf("failed to create dynamic client: %w", err)
	}

	// Define the GVR for LMEval
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevals",
	}

	// Delete the resource
	err = dynamicClient.Resource(gvr).Namespace(namespace).Delete(ctx, name, metav1.DeleteOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete LMEval: %w", err)
	}

	return nil
}

// Helper function to convert unstructured list to LMEvalList
func convertUnstructuredListToLMEvalList(unstructuredList *unstructured.UnstructuredList) (*models.LMEvalList, error) {
	var lmEvalList models.LMEvalList

	// Set metadata
	lmEvalList.APIVersion = unstructuredList.GetAPIVersion()
	lmEvalList.Kind = unstructuredList.GetKind()
	lmEvalList.Metadata.ResourceVersion = unstructuredList.GetResourceVersion()

	// Convert items
	for _, item := range unstructuredList.Items {
		var lmEval models.LMEvalKind
		err := runtime.DefaultUnstructuredConverter.FromUnstructured(item.UnstructuredContent(), &lmEval)
		if err != nil {
			// Log error but continue with other items
			continue
		}
		lmEvalList.Items = append(lmEvalList.Items, lmEval)
	}

	return &lmEvalList, nil
}
