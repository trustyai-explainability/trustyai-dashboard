package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/api"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/config"
	helper "github.com/trustyai-explainability/trustyai-dashboard/bff/internal/helpers"
)

func main() {
	fmt.Println("BFF v7")
	var cfg config.EnvConfig
	flag.IntVar(&cfg.Port, "port", helper.GetEnvAsInt("PORT", 8080), "API server port")
	flag.StringVar(&cfg.StaticAssetsDir, "static-assets-dir", "./static", "Configure frontend static assets root directory")
	flag.TextVar(&cfg.LogLevel, "log-level", helper.ParseLevel(helper.GetEnvAsString("LOG_LEVEL", "DEBUG")), "Sets server log level, possible values: error, warn, info, debug")
	flag.Func("allowed-origins", "Sets allowed origins for CORS purposes, accepts a comma separated list of origins or * to allow all, default none", helper.NewOriginParser(&cfg.AllowedOrigins, helper.GetEnvAsString("ALLOWED_ORIGINS", "")))
	flag.StringVar(&cfg.AuthMethod, "auth-method", "internal", "Authentication method (internal, user_token, oauth_proxy, or mock)")
	flag.StringVar(&cfg.AuthTokenHeader, "auth-token-header", helper.GetEnvAsString("AUTH_TOKEN_HEADER", config.DefaultAuthTokenHeader), "Header used to extract the token (e.g., Authorization)")
	flag.StringVar(&cfg.AuthTokenPrefix, "auth-token-prefix", helper.GetEnvAsString("AUTH_TOKEN_PREFIX", config.DefaultAuthTokenPrefix), "Prefix used in the token header (e.g., 'Bearer ')")
	flag.StringVar(&cfg.OAuthProxyTokenHeader, "oauth-proxy-token-header", helper.GetEnvAsString("OAUTH_PROXY_TOKEN_HEADER", config.DefaultOAuthProxyTokenHeader), "Header containing access token from OAuth proxy (e.g., X-forward-access-token)")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: cfg.LogLevel,
	}))

	//validate auth method
	if cfg.AuthMethod != config.AuthMethodInternal && cfg.AuthMethod != config.AuthMethodUser && cfg.AuthMethod != config.AuthMethodOAuthProxy && cfg.AuthMethod != config.AuthMethodMock {
		logger.Error("invalid auth method: (must be internal, user_token, oauth_proxy, or mock)", "authMethod", cfg.AuthMethod)
		os.Exit(1)
	}

	// Only use for logging errors about logging configuration.
	slog.SetDefault(logger)

	app, err := api.NewApp(cfg, slog.New(logger.Handler()))
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      app.Routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		ErrorLog:     slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	// Start the server in a goroutine
	go func() {
		logger.Info("starting server", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("HTTP server ListenAndServe", "error", err)
		}
	}()

	// Graceful shutdown setup
	shutdownCh := make(chan os.Signal, 1)
	signal.Notify(shutdownCh, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)

	// Wait for shutdown signal
	<-shutdownCh
	logger.Info("shutting down gracefully...")

	// Create a context with timeout for the shutdown process
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown the HTTP server gracefully
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("server shutdown failed", "error", err)
	}

	logger.Info("server stopped")
	os.Exit(0)

}
