#!/bin/bash

echo "🚀 Deploying Strapi with hardcoded YouTube API key..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Rebuild with no cache to ensure changes are included
echo "🔨 Rebuilding containers with no cache..."
docker-compose build --no-cache

# Start the containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Test the API
echo "🧪 Testing YouTube API configuration..."
API_STATUS=$(curl -s "https://api.pattaya1.com/api/featured-videos/test-status" | jq -r '.youtube_api_configured' 2>/dev/null)

if [ "$API_STATUS" = "true" ]; then
    echo "✅ YouTube API is now configured!"
    echo "🎬 Testing video fetch..."
    FETCH_RESULT=$(curl -s "https://api.pattaya1.com/api/featured-videos/test-fetch?keyword=pattaya" | jq -r '.success' 2>/dev/null)
    
    if [ "$FETCH_RESULT" = "true" ]; then
        echo "✅ Video fetching is working!"
        echo "🎉 Deployment successful! Featured videos should now work on api.pattaya1.com"
    else
        echo "❌ Video fetching failed. Check the logs."
    fi
else
    echo "❌ YouTube API is still not configured. Check the deployment."
fi

echo "📊 Final status check:"
curl -s "https://api.pattaya1.com/api/featured-videos/test-status" | jq '.database_counts' 2>/dev/null || echo "Status check failed"
