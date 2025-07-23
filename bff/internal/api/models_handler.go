package api

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
)

type ModelsEnvelope Envelope[[]models.ModelOption, None]

// GetModelsHandler handles GET /api/v1/models
func (app *App) GetModelsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	// Get Kubernetes client
	client, err := app.kubernetesClientFactory.GetClient(ctx)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	// Get accessible namespaces
	namespaces, err := client.GetNamespaces(ctx, identity)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get namespaces: %w", err))
		return
	}

	var modelOptions []models.ModelOption

	// Search for model serving services in each namespace
	for _, namespace := range namespaces {
		// Look for model serving services specifically
		serviceDetails, err := client.GetModelServingServices(ctx, namespace.Name)
		if err != nil {
			app.logger.Warn("Failed to get model serving services in namespace", "namespace", namespace.Name, "error", err)
			continue
		}

		// Convert services to model options
		for _, service := range serviceDetails {
			modelOption := convertServiceToModelOption(service, namespace.Name)
			modelOptions = append(modelOptions, modelOption)
		}
	}

	// If no models found through service discovery, provide fallback models
	if len(modelOptions) == 0 {
		app.logger.Warn("No model serving services found, providing fallback models")
		modelOptions = getFallbackModels()
	}

	response := ModelsEnvelope{
		Data: modelOptions,
	}

	err = app.WriteJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

// convertServiceToModelOption converts a Kubernetes service to a model option
func convertServiceToModelOption(service kubernetes.ServiceDetails, namespace string) models.ModelOption {
	displayName := service.DisplayName
	if displayName == "" {
		displayName = service.Name
	}
	
	// Construct service URL
	serviceURL := fmt.Sprintf("http://%s.%s.svc.cluster.local:%d", 
		service.Name, namespace, service.HTTPPort)
	
	return models.ModelOption{
		Value:       fmt.Sprintf("%s-%s", service.Name, namespace),
		Label:       displayName,
		DisplayName: displayName,
		Namespace:   namespace,
		Service:     serviceURL,
	}
}

// getFallbackModels provides fallback models when no services are discovered
func getFallbackModels() []models.ModelOption {
	return []models.ModelOption{
		{
			Value:       "openai-gpt-3.5-turbo",
			Label:       "OpenAI GPT-3.5 Turbo",
			DisplayName: "OpenAI GPT-3.5 Turbo",
			Namespace:   "external",
			Service:     "https://api.openai.com/v1",
		},
		{
			Value:       "openai-gpt-4",
			Label:       "OpenAI GPT-4",
			DisplayName: "OpenAI GPT-4",
			Namespace:   "external",
			Service:     "https://api.openai.com/v1",
		},
		{
			Value:       "huggingface-llama2-7b",
			Label:       "Llama 2 7B Chat (HuggingFace)",
			DisplayName: "Llama 2 7B Chat",
			Namespace:   "external",
			Service:     "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
		},
		{
			Value:       "anthropic-claude-3-opus",
			Label:       "Anthropic Claude 3 Opus",
			DisplayName: "Claude 3 Opus",
			Namespace:   "external",
			Service:     "https://api.anthropic.com/v1",
		},
		{
			Value:       "local-ollama",
			Label:       "Local Ollama Service",
			DisplayName: "Local Ollama",
			Namespace:   "local",
			Service:     "http://localhost:11434/v1",
		},
	}
}
