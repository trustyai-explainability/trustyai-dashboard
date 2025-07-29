# TrustyAI Dashboard Production Makefile

.PHONY: help build-frontend build-bff build-all deploy-prod clean test

# Default target
help:
	@echo "TrustyAI Dashboard Production Commands:"
	@echo ""
	@echo "  build-frontend  - Build frontend for production"
	@echo "  build-bff       - Build BFF for production"
	@echo "  build-all       - Build both frontend and BFF"
	@echo "  deploy-prod     - Full production deployment"
	@echo "  clean           - Clean all build artifacts"
	@echo "  test            - Run all tests"
	@echo "  docker-build    - Build Docker image"
	@echo "  docker-run      - Run Docker container"

# Build frontend for production
build-frontend:
	@echo "🏗️ Building frontend for production..."
	cd frontend && npm run build:prod

# Build BFF for production
build-bff:
	@echo "🏗️ Building BFF for production..."
	cd bff && go build -o main ./cmd
	@echo "✅ BFF built successfully!"

# Build both frontend and BFF
build-all: build-frontend build-bff
	@echo "✅ All components built successfully!"

# Copy frontend to BFF static directory
copy-static:
	@echo "📁 Copying frontend to BFF static directory..."
	mkdir -p bff/static
	cp -r frontend/dist/* bff/static/
	@echo "✅ Static files copied successfully!"

# Full production deployment
deploy-prod: build-all copy-static
	@echo "🚀 Production deployment ready!"
	@echo ""
	@echo "To start the BFF in production mode, run:"
	@echo "  cd bff && ./main --auth-method=oauth_proxy --allowed-origins=https://your-domain.com --static-assets-dir=./static --port=8080"
	@echo ""
	@echo "Or use Docker:"
	@echo "  docker build -t trustyai-dashboard ."
	@echo "  docker run -p 8080:8080 -e AUTH_METHOD=oauth_proxy -e ALLOWED_ORIGINS=https://your-domain.com trustyai-dashboard"

# Clean all build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	cd frontend && npm run clean
	cd bff && rm -f main
	rm -rf bff/static
	@echo "✅ Cleaned successfully!"

# Run all tests
test:
	@echo "🧪 Running tests..."
	cd frontend && npm test
	cd bff && go test ./...

# Build Docker image
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t trustyai-dashboard .
	@echo "✅ Docker image built successfully!"

# Run Docker container
docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 \
		-e AUTH_METHOD=oauth_proxy \
		-e ALLOWED_ORIGINS=https://your-domain.com \
		-e LOG_LEVEL=info \
		trustyai-dashboard

# Development commands
dev-frontend:
	@echo "🚀 Starting frontend in development mode..."
	cd frontend && npm run start:dev:real

dev-bff:
	@echo "🚀 Starting BFF in development mode..."
	cd bff && ./main --auth-method=internal --allowed-origins=http://localhost:9000

dev: dev-bff dev-frontend 