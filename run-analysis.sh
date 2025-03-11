#!/bin/bash

# Run the full analysis pipeline locally
# Usage: ./run-analysis.sh [owner] [repo]
# If owner and repo are not provided, values from .env will be used

# Load variables from .env file
if [ -f .env ]; then
  # Use a safer approach to load just the needed variables
  GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' .env | cut -d '=' -f2)
  REPO_OWNER=$(grep '^REPO_OWNER=' .env | cut -d '=' -f2)
  REPO_NAME=$(grep '^REPO_NAME=' .env | cut -d '=' -f2)
else
  echo "Error: .env file not found"
  echo "Please create a .env file with GITHUB_TOKEN, REPO_OWNER, and REPO_NAME"
  exit 1
fi

# Use command line arguments or defaults from .env
OWNER=${1:-$REPO_OWNER}
REPO=${2:-$REPO_NAME}
TOKEN=$GITHUB_TOKEN

# Check if USE_SAMPLE is already set in the environment
if [ -z "$USE_SAMPLE" ]; then
  # If not set, check if token is valid (not just a placeholder)
  if [ -z "$TOKEN" ] || [ "$TOKEN" == "your_new_secure_token_here" ] || [ "$TOKEN" == "your_personal_access_token" ]; then
    echo "⚠️  Warning: Using a placeholder GitHub token"
    echo "⚠️  This will use sample data instead of real GitHub data"
    echo "⚠️  To use real data, update the GITHUB_TOKEN in your .env file"
    USE_SAMPLE=true
  else
    USE_SAMPLE=false
  fi
else
  echo "Using USE_SAMPLE=$USE_SAMPLE from environment"
fi

TODAY=$(date +%Y-%m-%d)

# Create directories if they don't exist
mkdir -p data/raw/$TODAY
mkdir -p data/insights/$TODAY

echo "🔍 Fetching PR data for $OWNER/$REPO..."
GITHUB_TOKEN=$TOKEN USE_SAMPLE=$USE_SAMPLE node src/scripts/fetchPRData.js $OWNER $REPO > data/raw/$TODAY/pr-data.json

if [ $? -ne 0 ]; then
  echo "❌ Failed to fetch PR data"
  exit 1
fi

echo "📊 Analyzing PR data using rule-based analysis..."
node src/scripts/analyzePRs.js data/raw/$TODAY/pr-data.json > data/insights/$TODAY/pr-insights.json

if [ $? -ne 0 ]; then
  echo "❌ Failed to analyze PR data"
  exit 1
fi

echo "📝 Updating summary data..."
node src/scripts/updateSummary.js

if [ $? -ne 0 ]; then
  echo "❌ Failed to update summary"
  exit 1
fi

echo "✅ Analysis completed successfully!"
echo "📄 Raw data: data/raw/$TODAY/pr-data.json"
echo "📄 Insights: data/insights/$TODAY/pr-insights.json"
echo "📄 Summary: data/summary.json"
