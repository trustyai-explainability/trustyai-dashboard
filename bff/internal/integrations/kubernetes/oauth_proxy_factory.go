package kubernetes

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/config"
	"github.com/trustyai-explainability/trustyai-dashboard/bff/internal/constants"
)

// OAuthProxyClientFactory handles authentication via OAuth proxy sidecar
// This is the production mode for ODH integration where the OAuth proxy
// injects Kubernetes user tokens via X-forward-access-token header
type OAuthProxyClientFactory struct {
	Logger      *slog.Logger
	TokenHeader string
}

func NewOAuthProxyClientFactory(logger *slog.Logger, cfg config.EnvConfig) KubernetesClientFactory {
	return &OAuthProxyClientFactory{
		Logger:      logger,
		TokenHeader: cfg.OAuthProxyTokenHeader,
	}
}

func (f *OAuthProxyClientFactory) ExtractRequestIdentity(httpHeader http.Header) (*RequestIdentity, error) {
	token := httpHeader.Get(f.TokenHeader)
	if token == "" {
		return nil, fmt.Errorf("missing required header: %s", f.TokenHeader)
	}

	return &RequestIdentity{
		Token: strings.TrimSpace(token),
	}, nil
}

func (f *OAuthProxyClientFactory) ValidateRequestIdentity(identity *RequestIdentity) error {
	if identity == nil {
		return errors.New("missing identity")
	}

	if identity.Token == "" {
		return fmt.Errorf("token is required for OAuth proxy authentication")
	}

	return nil
}

func (f *OAuthProxyClientFactory) GetClient(ctx context.Context) (KubernetesClientInterface, error) {
	identityVal := ctx.Value(constants.RequestIdentityKey)
	if identityVal == nil {
		return nil, fmt.Errorf("missing RequestIdentity in context")
	}

	identity, ok := identityVal.(*RequestIdentity)
	if !ok || identity.Token == "" {
		return nil, fmt.Errorf("invalid or missing identity token")
	}

	return newTokenKubernetesClient(identity.Token, f.Logger)
}
