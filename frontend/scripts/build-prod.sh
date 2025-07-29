#!/bin/bash

# Production Build Script for TrustyAI Dashboard
set -e

echo "🚀 Building TrustyAI Dashboard for production..."

# Set production environment
export NODE_ENV=production
export AUTH_METHOD=oauth_proxy
export ENABLE_MOCK_DATA=false
export ENABLE_DEBUG_LOGGING=false

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --omit=optional

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

echo "🎉 Production build completed successfully!"
echo "📁 Build output: ./dist/"
echo "🚀 Ready for deployment!" 