package api

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
)

type LMEvalEnvelope Envelope[*models.LMEvalKind, None]
type LMEvalListEnvelope Envelope[*models.LMEvalList, None]
type LMEvalJobEnvelope Envelope[*models.LMEvalJobKind, None]
type LMEvalJobListEnvelope Envelope[*models.LMEvalJobList, None]

// CreateLMEvalHandler handles POST /api/v1/evaluations
func (app *App) CreateLMEvalHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	// Parse namespace from query parameter
	namespace := r.URL.Query().Get("namespace")
	if namespace == "" {
		app.badRequestResponse(w, r, fmt.Errorf("namespace parameter is required"))
		return
	}

	// Parse request body
	var createRequest models.LMEvalCreateRequest
	err := app.ReadJSON(w, r, &createRequest)
	if err != nil {
		app.badRequestResponse(w, r, fmt.Errorf("invalid request body: %w", err))
		return
	}

	// Validate required fields
	if createRequest.EvaluationName == "" {
		app.badRequestResponse(w, r, fmt.Errorf("evaluationName is required"))
		return
	}
	if createRequest.ModelType == "" {
		app.badRequestResponse(w, r, fmt.Errorf("modelType is required"))
		return
	}
	if len(createRequest.Tasks) == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("at least one task is required"))
		return
	}

	// Get Kubernetes client
	client, err := app.kubernetesClientFactory.GetClient(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	// Convert create request to LMEvalJobKind
	lmEvalJob := &models.LMEvalJobKind{
		APIVersion: "trustyai.opendatahub.io/v1alpha1",
		Kind:       "LMEvalJob",
		Metadata: models.LMEvalJobMetadata{
			Name:      createRequest.K8sName,
			Namespace: namespace,
			Annotations: map[string]string{
				"opendatahub.io/display-name": createRequest.EvaluationName,
			},
		},
		Spec: models.LMEvalJobSpec{
			AllowCodeExecution: createRequest.AllowRemoteCode,
			AllowOnline:        createRequest.AllowOnline,
			BatchSize:          createRequest.BatchSize,
			LogSamples:         true,
			Model:              mapModelTypeToSupportedType(createRequest.ModelType),
			ModelArgs:          convertModelArgsToJob(createRequest.Model),
			TaskList: models.LMEvalJobTaskList{
				TaskNames: createRequest.Tasks,
			},
			Outputs: &models.LMEvalJobOutputs{
				PVCManaged: &models.LMEvalJobPVCManaged{
					Size: "100Mi",
				},
			},
		},
	}

	// Create the LMEvalJob resource
	createdLMEvalJob, err := client.CreateLMEvalJob(ctx, identity, namespace, lmEvalJob)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to create LMEvalJob: %w", err))
		return
	}

	// Return the created resource
	response := LMEvalJobEnvelope{
		Data: createdLMEvalJob,
	}

	err = app.WriteJSON(w, http.StatusCreated, response, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

// GetLMEvalHandler handles GET /api/v1/evaluations/:name
func (app *App) GetLMEvalHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	// Parse parameters
	name := ps.ByName("name")
	if name == "" {
		app.badRequestResponse(w, r, fmt.Errorf("evaluation name is required"))
		return
	}

	namespace := r.URL.Query().Get("namespace")
	if namespace == "" {
		app.badRequestResponse(w, r, fmt.Errorf("namespace parameter is required"))
		return
	}

	// Get Kubernetes client
	client, err := app.kubernetesClientFactory.GetClient(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	// Get the LMEvalJob resource
	lmEvalJob, err := client.GetLMEvalJob(ctx, identity, namespace, name)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get LMEvalJob: %w", err))
		return
	}

	// Return the resource
	response := LMEvalJobEnvelope{
		Data: lmEvalJob,
	}

	err = app.WriteJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

// ListLMEvalsHandler handles GET /api/v1/evaluations
func (app *App) ListLMEvalsHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	// Parse namespace from query parameter (optional for listing)
	namespace := r.URL.Query().Get("namespace")

	// Get Kubernetes client
	client, err := app.kubernetesClientFactory.GetClient(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	// List LMEvalJob resources
	lmEvalJobList, err := client.ListLMEvalJobs(ctx, identity, namespace)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to list LMEvalJobs: %w", err))
		return
	}

	// Return the list
	response := LMEvalJobListEnvelope{
		Data: lmEvalJobList,
	}

	err = app.WriteJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

// DeleteLMEvalHandler handles DELETE /api/v1/evaluations/:name
func (app *App) DeleteLMEvalHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	// Parse parameters
	name := ps.ByName("name")
	if name == "" {
		app.badRequestResponse(w, r, fmt.Errorf("evaluation name is required"))
		return
	}

	namespace := r.URL.Query().Get("namespace")
	if namespace == "" {
		app.badRequestResponse(w, r, fmt.Errorf("namespace parameter is required"))
		return
	}

	// Get Kubernetes client
	client, err := app.kubernetesClientFactory.GetClient(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	// Delete the LMEvalJob resource
	err = client.DeleteLMEvalJob(ctx, identity, namespace, name)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to delete LMEvalJob: %w", err))
		return
	}

	// Return success response
	w.WriteHeader(http.StatusNoContent)
}

// Helper function to convert model configuration to LMEvalJob model arguments
func convertModelArgsToJob(modelConfig models.LMEvalModelConfig) []models.LMEvalJobModelArg {
	var args []models.LMEvalJobModelArg

	if modelConfig.Name != "" {
		// Extract just the model name without the predictor suffix
		modelName := strings.Replace(modelConfig.Name, "-predictor", "", 1)
		args = append(args, models.LMEvalJobModelArg{
			Name:  "model",
			Value: modelName,
		})
	}

	if modelConfig.URL != "" {
		// Remove port 80 from URL if present
		baseURL := strings.Replace(modelConfig.URL, ":80", "", 1)
		args = append(args, models.LMEvalJobModelArg{
			Name:  "base_url",
			Value: baseURL,
		})
	}

	if modelConfig.TokenizedRequest != "" {
		args = append(args, models.LMEvalJobModelArg{
			Name:  "tokenized_requests",
			Value: modelConfig.TokenizedRequest,
		})
	}

	if modelConfig.Tokenizer != "" {
		args = append(args, models.LMEvalJobModelArg{
			Name:  "tokenizer",
			Value: modelConfig.Tokenizer,
		})
	}

	// Add required parameters for local-completions model
	args = append(args, models.LMEvalJobModelArg{
		Name:  "num_concurrent",
		Value: "1",
	})
	args = append(args, models.LMEvalJobModelArg{
		Name:  "max_retries",
		Value: "3",
	})

	return args
}

// mapModelTypeToSupportedType maps frontend model types to TrustyAI operator supported types
func mapModelTypeToSupportedType(modelType string) string {
	// Map common model types to supported TrustyAI operator types
	switch {
	case strings.Contains(modelType, "tinyllm"):
		return "local-completions"
	case strings.Contains(modelType, "llama"):
		return "local-completions"
	case strings.Contains(modelType, "mistral"):
		return "local-completions"
	case strings.Contains(modelType, "openai"):
		return "openai-completions"
	case strings.Contains(modelType, "huggingface") || strings.Contains(modelType, "hf"):
		return "hf"
	case strings.Contains(modelType, "watsonx"):
		return "watsonx_llm"
	case strings.Contains(modelType, "textsynth"):
		return "textsynth"
	default:
		// Default to local-completions for unknown types
		return "local-completions"
	}
}
