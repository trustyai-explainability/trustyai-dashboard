package api

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
)

type ModelsEnvelope Envelope[[]models.ModelOption, None]

// GetModelsHandler handles GET /api/v1/models
func (app *App) GetModelsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// For now, return a static list of available models
	// In the future, this could be fetched from a model registry or Kubernetes resources
	models := []models.ModelOption{
		{
			Value:       "llama2-7b-chat",
			Label:       "Llama 2 7B Chat",
			DisplayName: "Llama 2 7B Chat",
			Namespace:   "default",
			Service:     "https://api.example.com/llama2-7b-chat",
		},
		{
			Value:       "gpt-3.5-turbo",
			Label:       "GPT-3.5 Turbo",
			DisplayName: "GPT-3.5 Turbo",
			Namespace:   "default",
			Service:     "https://api.openai.com/v1",
		},
		{
			Value:       "gpt-4",
			Label:       "GPT-4",
			DisplayName: "GPT-4",
			Namespace:   "default",
			Service:     "https://api.openai.com/v1",
		},
		{
			Value:       "claude-3-opus",
			Label:       "Claude 3 Opus",
			DisplayName: "Claude 3 Opus",
			Namespace:   "default",
			Service:     "https://api.anthropic.com/v1",
		},
		{
			Value:       "mistral-7b-instruct",
			Label:       "Mistral 7B Instruct",
			DisplayName: "Mistral 7B Instruct",
			Namespace:   "default",
			Service:     "https://api.mistral.ai/v1",
		},
	}

	response := ModelsEnvelope{
		Data: models,
	}

	err := app.WriteJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
} 