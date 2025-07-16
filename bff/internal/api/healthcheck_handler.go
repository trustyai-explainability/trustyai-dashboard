package api

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/models"
)

func (app *App) HealthcheckHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	healthCheck := models.HealthCheckModel{
		Status: "available",
		SystemInfo: models.SystemInfo{
			Version: "1.0",
		},
		UserID: "id",
	}

	err := app.WriteJSON(w, http.StatusOK, healthCheck, nil)

	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

}
