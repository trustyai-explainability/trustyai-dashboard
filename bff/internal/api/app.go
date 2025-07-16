package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"path"

	"github.com/julienschmidt/httprouter"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/config"
	helper "github.com/trustyai-explainability/trustyai-dashboard/bff/internal/helpers"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/integrations/kubernetes"
)

const (
	Version = "1.0.0"

	ApiPathPrefix   = "/api/v1"
	HealthCheckPath = "/healthcheck"
	UserPath        = ApiPathPrefix + "/user"
	NamespacesPath  = ApiPathPrefix + "/namespaces"
	EvaluationsPath = ApiPathPrefix + "/evaluations"
	ModelsPath      = ApiPathPrefix + "/models"
)

type App struct {
	config                  config.EnvConfig
	logger                  *slog.Logger
	kubernetesClientFactory kubernetes.KubernetesClientFactory
}

func NewApp(cfg config.EnvConfig, logger *slog.Logger) (*App, error) {
	logger.Debug("Initializing app with config", slog.Any("config", cfg))

	k8sFactory, err := kubernetes.NewKubernetesClientFactory(cfg, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kubernetes client: %w", err)
	}

	app := &App{
		config:                  cfg,
		logger:                  logger,
		kubernetesClientFactory: k8sFactory,
	}
	return app, nil
}

func (app *App) Routes() http.Handler {
	// Router for /api/v1/*
	apiRouter := httprouter.New()

	apiRouter.NotFound = http.HandlerFunc(app.notFoundResponse)
	apiRouter.MethodNotAllowed = http.HandlerFunc(app.methodNotAllowedResponse)

	// Kubernetes routes
	apiRouter.GET(UserPath, app.UserHandler)
	apiRouter.GET(NamespacesPath, app.GetNamespacesHandler)

	// LMEval routes
	apiRouter.GET(EvaluationsPath, app.ListLMEvalsHandler)
	apiRouter.POST(EvaluationsPath, app.CreateLMEvalHandler)
	apiRouter.GET(EvaluationsPath+"/:name", app.GetLMEvalHandler)
	apiRouter.DELETE(EvaluationsPath+"/:name", app.DeleteLMEvalHandler)

	// Models routes
	apiRouter.GET(ModelsPath, app.GetModelsHandler)

	// App Router
	appMux := http.NewServeMux()

	// handler for api calls
	appMux.Handle(ApiPathPrefix+"/", apiRouter)

	//file server for the frontend file and SPA routes
	staticDir := http.Dir(app.config.StaticAssetsDir)
	fileServer := http.FileServer(staticDir)

	// Handle assets directory explicitly
	//appMux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(path.Join(app.config.StaticAssetsDir, "assets")))))

	// Handle root and other paths
	appMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ctxLogger := helper.GetContextLoggerFromReq(r)

		// Log all incoming requests to help debug
		ctxLogger.Debug("Received request",
			slog.String("path", r.URL.Path),
			slog.String("method", r.Method))

		// Check if the requested file exists
		if _, err := staticDir.Open(r.URL.Path); err == nil {
			ctxLogger.Debug("Serving static file", slog.String("path", r.URL.Path))
			// Serve the file if it exists
			fileServer.ServeHTTP(w, r)
			return
		}

		// Fallback to index.html for SPA routes
		ctxLogger.Debug("Static asset not found, serving index.html", slog.String("path", r.URL.Path))
		http.ServeFile(w, r, path.Join(app.config.StaticAssetsDir, "index.html"))
	})

	healthcheckMux := http.NewServeMux()
	healthcheckRouter := httprouter.New()
	healthcheckRouter.GET(HealthCheckPath, app.HealthcheckHandler)
	healthcheckMux.Handle(HealthCheckPath, app.RecoverPanic(app.EnableTelemetry(healthcheckRouter)))

	// Combines the healthcheck endpoint with the rest of the routes
	combinedMux := http.NewServeMux()
	combinedMux.Handle(HealthCheckPath, healthcheckMux)
	combinedMux.Handle("/", app.RecoverPanic(app.EnableTelemetry(app.EnableCORS(app.InjectRequestIdentity(appMux)))))

	return combinedMux
}
