#!/bin/bash

echo "🧪 Testing Semantic Release Configuration"
echo "========================================"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  GITHUB_TOKEN not set. Using dry-run mode only."
  echo "   To test with GitHub integration, run:"
  echo "   GITHUB_TOKEN=your-token $0"
  echo ""
fi

# Run semantic-release in dry-run mode
echo "Running semantic-release in dry-run mode..."
echo ""

pnpm exec semantic-release --dry-run --no-ci

echo ""
echo "✅ Test complete!"
echo ""
echo "If you see 'The next release version is X.X.X', the configuration is working!"
echo "If not, check the error messages above."