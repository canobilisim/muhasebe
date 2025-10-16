#!/bin/bash

# Deployment script for Cano Ön Muhasebe
set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Required environment variables are not set"
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Optional: Deploy to specific platform
case "${DEPLOY_TARGET:-}" in
    "vercel")
        echo "🌐 Deploying to Vercel..."
        npx vercel --prod
        ;;
    "netlify")
        echo "🌐 Deploying to Netlify..."
        npx netlify deploy --prod --dir=dist
        ;;
    "docker")
        echo "🐳 Building Docker image..."
        docker build -t cano-muhasebe:latest .
        echo "✅ Docker image built successfully!"
        ;;
    *)
        echo "📁 Build artifacts are ready in ./dist directory"
        echo "You can now deploy the contents to your hosting provider"
        ;;
esac

echo "🎉 Deployment process completed!"