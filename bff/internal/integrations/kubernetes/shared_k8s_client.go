package kubernetes

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
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

// GetModelServingServices discovers model serving services in a namespace
func (kc *SharedClientLogic) GetModelServingServices(sessionCtx context.Context, namespace string) ([]ServiceDetails, error) {
	if namespace == "" {
		return nil, fmt.Errorf("namespace cannot be empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	sessionLogger := sessionCtx.Value(constants.TraceLoggerKey).(*slog.Logger)

	// Get all services in the namespace
	serviceList, err := kc.Client.CoreV1().Services(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %w", err)
	}

	var modelServices []ServiceDetails

	for _, service := range serviceList.Items {
		// Check if this is a model serving service
		if isModelServingService(&service) {
			serviceDetails, err := buildModelServingServiceDetails(&service, sessionLogger)
			if err != nil {
				sessionLogger.Warn("skipping model serving service", "service", service.Name, "error", err)
				continue
			}
			modelServices = append(modelServices, *serviceDetails)
		}
	}

	return modelServices, nil
}

// isModelServingService checks if a service is a model serving service
func isModelServingService(service *corev1.Service) bool {
	if service == nil {
		return false
	}

	serviceName := service.Name
	labels := service.Labels
	annotations := service.Annotations

	// Check for KServe services
	if labels != nil {
		if labels["serving.kserve.io/inferenceservice"] != "" ||
			labels["component"] == "predictor" ||
			labels["app"] == "kserve" {
			return true
		}
	}

	// Check for ModelMesh services
	if serviceName == "modelmesh-serving" ||
		serviceName == "model-mesh" ||
		(labels != nil && labels["app"] == "modelmesh") {
		return true
	}

	// Check for OpenShift AI/ODH model serving
	if serviceName == "model-registry-service" ||
		serviceName == "model-registry" ||
		serviceName == "odh-model-controller" {
		return true
	}

	// Check for Seldon services
	if labels != nil && (labels["app"] == "seldon" || labels["seldon-app"] != "") {
		return true
	}

	// Check for MLflow services
	if serviceName == "mlflow-server" ||
		serviceName == "mlflow-tracking" ||
		(labels != nil && labels["app"] == "mlflow") {
		return true
	}

	// Check for TorchServe
	if serviceName == "torchserve" ||
		(labels != nil && labels["app"] == "torchserve") {
		return true
	}

	// Check for NVIDIA Triton
	if serviceName == "triton-inference-server" ||
		(labels != nil && labels["app"] == "triton") {
		return true
	}

	// Check for generic ML/AI services by annotations
	if annotations != nil {
		if annotations["serving.kubeflow.org/inferenceservice"] != "" ||
			annotations["ai.openshift.io/model-serving"] != "" ||
			annotations["opendatahub.io/model-serving"] != "" {
			return true
		}
	}

	// Check for services with model serving in the name
	if strings.Contains(serviceName, "model") &&
		(strings.Contains(serviceName, "serve") ||
			strings.Contains(serviceName, "infer") ||
			strings.Contains(serviceName, "predict")) {
		return true
	}

	return false
}

// buildModelServingServiceDetails builds service details for model serving services
func buildModelServingServiceDetails(service *corev1.Service, logger *slog.Logger) (*ServiceDetails, error) {
	if service == nil {
		return nil, fmt.Errorf("service cannot be nil")
	}

	// Try to find the main HTTP port (more flexible than just http-api)
	var httpPort int32
	hasHTTPPort := false

	// Look for common HTTP port names
	httpPortNames := []string{"http-api", "http", "web", "serving", "inference", "predict"}

	for _, portName := range httpPortNames {
		for _, port := range service.Spec.Ports {
			if port.Name == portName {
				httpPort = port.Port
				hasHTTPPort = true
				break
			}
		}
		if hasHTTPPort {
			break
		}
	}

	// If no named port found, try to find HTTP ports by port number
	if !hasHTTPPort {
		for _, port := range service.Spec.Ports {
			// Common HTTP ports
			if port.Port == 80 || port.Port == 8080 || port.Port == 8000 ||
				port.Port == 5000 || port.Port == 9000 {
				httpPort = port.Port
				hasHTTPPort = true
				break
			}
		}
	}

	// If still no port found, use the first port
	if !hasHTTPPort && len(service.Spec.Ports) > 0 {
		httpPort = service.Spec.Ports[0].Port
		hasHTTPPort = true
		logger.Warn("Using first available port for model serving service",
			"serviceName", service.Name, "port", httpPort)
	}

	if !hasHTTPPort {
		return nil, fmt.Errorf("service %q has no usable HTTP port", service.Name)
	}

	if service.Spec.ClusterIP == "" {
		return nil, fmt.Errorf("service %q missing ClusterIP", service.Name)
	}

	// Extract display name and description
	displayName := service.Name
	description := "Model serving service"

	if service.Annotations != nil {
		if dn := service.Annotations["opendatahub.io/display-name"]; dn != "" {
			displayName = dn
		} else if dn := service.Annotations["serving.kubeflow.org/display-name"]; dn != "" {
			displayName = dn
		}

		if desc := service.Annotations["opendatahub.io/description"]; desc != "" {
			description = desc
		} else if desc := service.Annotations["serving.kubeflow.org/description"]; desc != "" {
			description = desc
		}
	}

	return &ServiceDetails{
		Name:        service.Name,
		DisplayName: displayName,
		Description: description,
		ClusterIP:   service.Spec.ClusterIP,
		HTTPPort:    httpPort,
	}, nil
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

// LMEvalJob CRUD operations
func (kc *SharedClientLogic) CreateLMEvalJob(ctx context.Context, identity *RequestIdentity, namespace string, lmEvalJob *models.LMEvalJobKind) (*models.LMEvalJobKind, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Get the base config from the existing client
	baseConfig := kc.Client.CoreV1().RESTClient().Get().URL()

	// Create dynamic client config using the same TLS settings as the main client
	config := &rest.Config{
		Host:        baseConfig.Scheme + "://" + baseConfig.Host,
		BearerToken: kc.Token.Raw(),
		TLSClientConfig: rest.TLSClientConfig{
			// For development, allow insecure connections
			// In production, this should be configured properly
			Insecure: true,
		},
	}

	// Create dynamic client for custom resources
	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create dynamic client: %w", err)
	}

	// Define the GVR for LMEvalJob
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevaljobs",
	}

	// Validate the LMEvalJob object before creation
	if err := validateLMEvalJob(lmEvalJob); err != nil {
		return nil, fmt.Errorf("invalid LMEvalJob object: %w", err)
	}

	// Convert to unstructured
	unstructuredObj, err := runtime.DefaultUnstructuredConverter.ToUnstructured(lmEvalJob)
	if err != nil {
		return nil, fmt.Errorf("failed to convert to unstructured: %w", err)
	}

	// Create the resource
	result, err := dynamicClient.Resource(gvr).Namespace(namespace).Create(ctx, &unstructured.Unstructured{Object: unstructuredObj}, metav1.CreateOptions{})
	if err != nil {
		// Provide more detailed error information
		if strings.Contains(err.Error(), "no matches for kind") {
			return nil, fmt.Errorf("LMEvalJob CRD not found - ensure TrustyAI operator is installed: %w", err)
		}
		if strings.Contains(err.Error(), "forbidden") {
			return nil, fmt.Errorf("insufficient permissions to create LMEvalJob in namespace %s: %w", namespace, err)
		}
		return nil, fmt.Errorf("failed to create LMEvalJob: %w", err)
	}

	// Convert back to LMEvalJobKind
	var createdLMEvalJob models.LMEvalJobKind
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(result.UnstructuredContent(), &createdLMEvalJob)
	if err != nil {
		return nil, fmt.Errorf("failed to convert created resource from unstructured: %w", err)
	}

	return &createdLMEvalJob, nil
}

// validateLMEvalJob validates the LMEvalJob object before creation
func validateLMEvalJob(lmEvalJob *models.LMEvalJobKind) error {
	if lmEvalJob == nil {
		return fmt.Errorf("LMEvalJob object cannot be nil")
	}

	if lmEvalJob.Metadata.Name == "" {
		return fmt.Errorf("LMEvalJob name is required")
	}

	if lmEvalJob.Metadata.Namespace == "" {
		return fmt.Errorf("LMEvalJob namespace is required")
	}

	if lmEvalJob.Spec.Model == "" {
		return fmt.Errorf("LMEvalJob model is required")
	}

	if len(lmEvalJob.Spec.TaskList.TaskNames) == 0 {
		return fmt.Errorf("LMEvalJob must have at least one task")
	}

	// Validate Kubernetes name format
	if !isValidKubernetesName(lmEvalJob.Metadata.Name) {
		return fmt.Errorf("LMEvalJob name must be a valid Kubernetes resource name")
	}

	return nil
}

// isValidKubernetesName checks if a name is valid for Kubernetes resources
func isValidKubernetesName(name string) bool {
	if len(name) == 0 || len(name) > 253 {
		return false
	}

	// Check for valid characters (lowercase letters, numbers, hyphens)
	for _, r := range name {
		if !((r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-') {
			return false
		}
	}

	// Must start and end with alphanumeric
	if name[0] == '-' || name[len(name)-1] == '-' {
		return false
	}

	return true
}

func (kc *SharedClientLogic) GetLMEvalJob(ctx context.Context, identity *RequestIdentity, namespace, name string) (*models.LMEvalJobKind, error) {
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

	// Define the GVR for LMEvalJob
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevaljobs",
	}

	// Get the resource
	result, err := dynamicClient.Resource(gvr).Namespace(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get LMEvalJob: %w", err)
	}

	// Convert to LMEvalJobKind
	var lmEvalJob models.LMEvalJobKind
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(result.UnstructuredContent(), &lmEvalJob)
	if err != nil {
		return nil, fmt.Errorf("failed to convert from unstructured: %w", err)
	}

	return &lmEvalJob, nil
}

func (kc *SharedClientLogic) ListLMEvalJobs(ctx context.Context, identity *RequestIdentity, namespace string) (*models.LMEvalJobList, error) {
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

	// Define the GVR for LMEvalJob
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevaljobs",
	}

	// List the resources
	var listOptions metav1.ListOptions
	if namespace == "" {
		// List across all namespaces
		result, err := dynamicClient.Resource(gvr).List(ctx, listOptions)
		if err != nil {
			return nil, fmt.Errorf("failed to list LMEvalJobs: %w", err)
		}
		return convertUnstructuredListToLMEvalJobList(result)
	} else {
		// List in specific namespace
		result, err := dynamicClient.Resource(gvr).Namespace(namespace).List(ctx, listOptions)
		if err != nil {
			return nil, fmt.Errorf("failed to list LMEvalJobs in namespace %s: %w", namespace, err)
		}
		return convertUnstructuredListToLMEvalJobList(result)
	}
}

func (kc *SharedClientLogic) DeleteLMEvalJob(ctx context.Context, identity *RequestIdentity, namespace, name string) error {
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

	// Define the GVR for LMEvalJob
	gvr := schema.GroupVersionResource{
		Group:    "trustyai.opendatahub.io",
		Version:  "v1alpha1",
		Resource: "lmevaljobs",
	}

	// Delete the resource
	err = dynamicClient.Resource(gvr).Namespace(namespace).Delete(ctx, name, metav1.DeleteOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete LMEvalJob: %w", err)
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

// Helper function to convert unstructured list to LMEvalJobList
func convertUnstructuredListToLMEvalJobList(unstructuredList *unstructured.UnstructuredList) (*models.LMEvalJobList, error) {
	var lmEvalJobList models.LMEvalJobList

	// Set metadata
	lmEvalJobList.APIVersion = unstructuredList.GetAPIVersion()
	lmEvalJobList.Kind = unstructuredList.GetKind()
	lmEvalJobList.Metadata.ResourceVersion = unstructuredList.GetResourceVersion()

	// Convert items
	for _, item := range unstructuredList.Items {
		var lmEvalJob models.LMEvalJobKind
		err := runtime.DefaultUnstructuredConverter.FromUnstructured(item.UnstructuredContent(), &lmEvalJob)
		if err != nil {
			// Log error but continue with other items
			continue
		}
		lmEvalJobList.Items = append(lmEvalJobList.Items, lmEvalJob)
	}

	return &lmEvalJobList, nil
}
