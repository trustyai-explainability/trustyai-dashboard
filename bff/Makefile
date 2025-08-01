PORT ?= 8080
#MOCK_K8S_CLIENT ?= false
#MOCK_MR_CLIENT ?= false
#DEV_MODE ?= false
#DEV_MODE_PORT ?= 8080
#STANDALONE_MODE ?= true
#frontend static assets root directory
STATIC_ASSETS_DIR ?= ./static
# ENVTEST_K8S_VERSION refers to the version of kubebuilder assets to be downloaded by envtest binary.
ENVTEST_K8S_VERSION = 1.29.0
LOG_LEVEL ?= debug
ALLOWED_ORIGINS ?= ""

.PHONY: all
all: build

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: fmt
fmt: ## Applies the correct code style to source files using go fmt.
	go fmt ./...

.PHONY: clean ## Deletes previously built binaries.
clean:
	rm -Rf ./bin

.PHONY: lint
lint: golangci-lint ## Run golangci-lint to automatically check source code for programmatic and stylistic errors.
	$(GOLANGCI_LINT) run --timeout=5m

.PHONY: lint-fix
lint-fix: golangci-lint ## Run golangci-lint to automatically check source code for programmatic and stylistic errors and, additionally perform fixes where possible.
	$(GOLANGCI_LINT) run --fix --timeout=5m

.PHONY: vet
vet:  . ## Runs static analysis tools on source files and reports suspicious constructs that could be bugs or syntactical errors.
	go vet ./...

.PHONY: test
test: fmt vet envtest ## Runs the full test suite.
	ENVTEST_ASSETS="$(shell $(ENVTEST) use $(ENVTEST_K8S_VERSION) --bin-dir $(LOCALBIN) -p path)" \
	go test ./...

.PHONY: build
build: fmt vet test ## Builds the project to produce a binary executable.
	go build -o bin/bff ./cmd

.PHONY: run
run: fmt vet envtest ## Runs the project.
	ENVTEST_ASSETS="$(shell $(ENVTEST) use $(ENVTEST_K8S_VERSION) --bin-dir $(LOCALBIN) -p path)" \
	go run ./cmd --port=$(PORT) --static-assets-dir=$(STATIC_ASSETS_DIR) --log-level=$(LOG_LEVEL) --allowed-origins=$(ALLOWED_ORIGINS)

.PHONY: dev
dev: ## Runs the project in development mode with mock auth and CORS for ODH dashboard.
	go run ./cmd --port=8080 --auth-method=mock --allowed-origins=http://localhost:4010,http://localhost:9000 --log-level=debug

##@ Dependencies

## Location to install dependencies to
LOCALBIN ?= $(shell pwd)/bin
$(LOCALBIN):
	mkdir -p $(LOCALBIN)

## Tool Binaries
ENVTEST ?= $(LOCALBIN)/setup-envtest-$(ENVTEST_VERSION)
GOLANGCI_LINT ?= $(LOCALBIN)/golangci-lint-$(GOLANGCI_LINT_VERSION)

## Tool Versions
GOLANGCI_LINT_VERSION ?= v1.63.4
ENVTEST_VERSION ?= release-0.17

.PHONY: envtest
envtest: $(ENVTEST) ## Download setup-envtest locally if necessary.
$(ENVTEST): $(LOCALBIN)
	$(call go-install-tool,$(ENVTEST),sigs.k8s.io/controller-runtime/tools/setup-envtest,$(ENVTEST_VERSION))

.PHONY: golangci-lint
golangci-lint: $(GOLANGCI_LINT) ## Download golangci-lint locally if necessary.
$(GOLANGCI_LINT): $(LOCALBIN)
	$(call go-install-tool,$(GOLANGCI_LINT),github.com/golangci/golangci-lint/cmd/golangci-lint,${GOLANGCI_LINT_VERSION})


# go-install-tool will 'go install' any package with custom target and name of binary, if it doesn't exist
# $1 - target path with name of binary (ideally with version)
# $2 - package url which can be installed
# $3 - specific version of package
define go-install-tool
@[ -f $(1) ] || { \
set -e; \
package=$(2)@$(3) ;\
echo "Downloading $${package}" ;\
GOBIN=$(LOCALBIN) go install $${package} ;\
mv "$$(echo "$(1)" | sed "s/-$(3)$$//")" $(1) ;\
}
endef
