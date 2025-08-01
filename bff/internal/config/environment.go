package config

import "log/slog"

const (
	// AuthMethodInternal uses the credentials of the running backend.
	// If running inside the cluster, it uses the pod's service account.
	// If running locally (e.g. for development), it uses the current user's kubeconfig context.
	// This is the default authentication method.
	// This uses kubeflow-userid header to carry the user identity.
	AuthMethodInternal = "internal"

	// AuthMethodUser uses a user-provided Bearer token for authentication.
	AuthMethodUser = "user_token"

	// AuthMethodOAuthProxy uses OAuth proxy sidecar authentication.
	// This is the production mode for ODH integration where the OAuth proxy
	// injects Kubernetes user tokens via X-forward-access-token header.
	AuthMethodOAuthProxy = "oauth_proxy"

	// AuthMethodMock uses a mock client for local development without requiring a Kubernetes cluster.
	AuthMethodMock = "mock"

	// DefaultAuthTokenHeader is the standard header for Bearer token auth.
	DefaultAuthTokenHeader = "Authorization"

	// DefaultAuthTokenPrefix is the prefix used in the Authorization header.
	// note: the space here is intentional, as the prefix is "Bearer " (with a space).
	DefaultAuthTokenPrefix = "Bearer "

	// DefaultOAuthProxyTokenHeader is the header used by OAuth proxy to inject access tokens.
	DefaultOAuthProxyTokenHeader = "X-forward-access-token"
)

type EnvConfig struct {
	Port            int
	StaticAssetsDir string
	LogLevel        slog.Level
	AllowedOrigins  []string

	// ─── AUTH ───────────────────────────────────────────────────
	// Specifies the authentication method used by the server.
	// Valid values: "internal", "user_token", "oauth_proxy", or "mock"
	AuthMethod string

	// Header used to extract the authentication token.
	// Default is "Authorization" and can be overridden via CLI/env for proxy integration scenarios.
	AuthTokenHeader string

	// Optional prefix to strip from the token header value.
	// Default is "Bearer ", can be set to empty if the token is sent without a prefix.
	AuthTokenPrefix string

	// OAuth Proxy specific configuration
	// Header used to extract the access token from OAuth proxy sidecar
	OAuthProxyTokenHeader string
}
