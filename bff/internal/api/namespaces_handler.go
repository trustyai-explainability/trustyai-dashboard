package api

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
)

type NamespacesEnvelope Envelope[[]models.NamespaceModel, None]

func (app *App) GetNamespacesHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	client, err := app.kubernetesClientFactory.GetClient(ctx)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	namespaces, err := client.GetNamespaces(ctx, identity)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	var namespaceModels = []models.NamespaceModel{}
	for _, ns := range namespaces {
		namespaceModels = append(namespaceModels, models.NamespaceModel{Name: ns.Name})
	}

	namespacesEnvelope := NamespacesEnvelope{
		Data: namespaceModels,
	}

	err = app.WriteJSON(w, http.StatusOK, namespacesEnvelope, nil)

	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
