#!/bin/bash

echo "🔄 Restarting Strapi to apply schema changes..."

# Kill any existing Strapi processes
pkill -f "strapi develop" 2>/dev/null || true
pkill -f "node.*strapi" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

echo "✅ Stopped existing Strapi processes"

# Start Strapi in development mode
echo "🚀 Starting Strapi..."
pnpm develop

echo "✅ Strapi should now be running with updated schema!"
echo "📝 Go to http://localhost:1337/admin to test the new widget selection"
echo "📖 Check WIDGET_SELECTION_GUIDE.md for instructions on how to use the JSON field"
