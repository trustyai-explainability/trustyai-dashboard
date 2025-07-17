package api

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
)

type LMEvalEnvelope Envelope[*models.LMEvalKind, None]
type LMEvalListEnvelope Envelope[*models.LMEvalList, None]

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

	// Convert create request to LMEvalKind
	lmEval := &models.LMEvalKind{
		APIVersion: "trustyai.opendatahub.io/v1alpha1",
		Kind:       "LMEval",
		Metadata: models.LMEvalMetadata{
			Name:      createRequest.K8sName,
			Namespace: namespace,
			Annotations: map[string]string{
				"opendatahub.io/display-name": createRequest.EvaluationName,
			},
		},
		Spec: models.LMEvalSpec{
			AllowCodeExecution: createRequest.AllowRemoteCode,
			AllowOnline:        createRequest.AllowOnline,
			BatchSize:          createRequest.BatchSize,
			LogSamples:         true,
			Model:              createRequest.ModelType,
			ModelArgs:          convertModelArgs(createRequest.Model),
			TaskList: models.LMEvalTaskList{
				TaskNames: createRequest.Tasks,
			},
			Outputs: &models.LMEvalOutputs{
				PVCManaged: &models.LMEvalPVCManaged{
					Size: "100Mi",
				},
			},
		},
	}

	// Create the LMEval resource
	createdLMEval, err := client.CreateLMEval(ctx, identity, namespace, lmEval)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to create LMEval: %w", err))
		return
	}

	// Return the created resource
	response := LMEvalEnvelope{
		Data: createdLMEval,
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

	// Get the LMEval resource
	lmEval, err := client.GetLMEval(ctx, identity, namespace, name)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get LMEval: %w", err))
		return
	}

	// Return the resource
	response := LMEvalEnvelope{
		Data: lmEval,
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

	// List LMEval resources
	lmEvalList, err := client.ListLMEvals(ctx, identity, namespace)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to list LMEvals: %w", err))
		return
	}

	// Return the list
	response := LMEvalListEnvelope{
		Data: lmEvalList,
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

	// Delete the LMEval resource
	err = client.DeleteLMEval(ctx, identity, namespace, name)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to delete LMEval: %w", err))
		return
	}

	// Return success response
	w.WriteHeader(http.StatusNoContent)
}

// Helper function to convert model configuration to model arguments
func convertModelArgs(modelConfig models.LMEvalModelConfig) []models.LMEvalModelArg {
	var args []models.LMEvalModelArg

	if modelConfig.Name != "" {
		args = append(args, models.LMEvalModelArg{
			Name:  "model",
			Value: modelConfig.Name,
		})
	}

	if modelConfig.URL != "" {
		args = append(args, models.LMEvalModelArg{
			Name:  "url",
			Value: modelConfig.URL,
		})
	}

	if modelConfig.TokenizedRequest != "" {
		args = append(args, models.LMEvalModelArg{
			Name:  "tokenized_request",
			Value: modelConfig.TokenizedRequest,
		})
	}

	if modelConfig.Tokenizer != "" {
		args = append(args, models.LMEvalModelArg{
			Name:  "tokenizer",
			Value: modelConfig.Tokenizer,
		})
	}

	return args
}
