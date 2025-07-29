#!/bin/bash

# Production Deployment Script for TrustyAI BFF
set -e

echo "🚀 Deploying TrustyAI BFF for production..."

# Set production environment variables
export AUTH_METHOD=oauth_proxy
export LOG_LEVEL=info

# Build the BFF
echo "🏗️ Building BFF..."
go build -o main ./cmd

# Verify build
if [ ! -f "main" ]; then
    echo "❌ Build failed: main binary not found"
    exit 1
fi

echo "✅ BFF built successfully!"

# Production run command
echo "🚀 Starting BFF in production mode..."
echo "Command: ./main --auth-method=oauth_proxy --allowed-origins=https://your-domain.com --static-assets-dir=./static --port=8080"

# Uncomment the line below to actually run the server
# ./main --auth-method=oauth_proxy --allowed-origins=https://your-domain.com --static-assets-dir=./static --port=8080

echo "📝 Production deployment ready!"
echo "💡 To start the server, run:"
echo "   ./main --auth-method=oauth_proxy --allowed-origins=https://your-domain.com --static-assets-dir=./static --port=8080" 