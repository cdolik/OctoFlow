#!/bin/bash

echo "🔍 Verifying OctoFlow deployment configuration..."

# Clean up
echo "🧹 Cleaning up previous builds..."
rm -rf node_modules/.cache build

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Verify local development
echo "🏃 Starting local development server..."
echo "✅ Please verify the following manually:"
echo "  1. Open http://localhost:3000 (should NOT have /OctoFlow)"
echo "  2. Test routes: /#/assessment and /#/results"
echo "  3. Verify page reloads work without errors"

# Build for production
echo "🏗️ Building for production..."
npm run build

echo "✅ Verification checklist:"
echo "  1. Homepage in package.json is set to: https://cdolik.github.io/OctoFlow"
echo "  2. No PUBLIC_URL in deployment scripts"
echo "  3. HashRouter configuration is correct (no basename)"
echo "  4. Webpack configuration includes react-refresh fixes"

echo "🚀 Ready for deployment!"
echo "To deploy, run: npm run deploy-mvp" 