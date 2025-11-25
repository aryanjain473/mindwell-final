#!/bin/bash
# Production Build Script for MindWell Platform

set -e  # Exit on error

echo "🚀 Starting production build process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production not found${NC}"
    echo "Creating from .env.production.example..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}⚠️  Please update .env.production with your production values${NC}"
    else
        echo -e "${RED}❌ Error: .env.production.example not found${NC}"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build frontend
echo "🏗️  Building frontend..."
npm run build:prod

# Check if build was successful
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Frontend build successful!${NC}"
    echo "📁 Build output: dist/"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

# Display build info
echo ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "📊 Build Summary:"
echo "  - Frontend: dist/"
echo "  - Ready for deployment"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run preview"
echo "  2. Deploy to Vercel: vercel --prod"
echo "  3. Or push to GitHub and deploy via dashboard"

