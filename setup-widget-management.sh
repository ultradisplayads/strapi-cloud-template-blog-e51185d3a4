#!/bin/bash

echo "🚀 Setting up Widget Management System for Pattaya"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the strapi_backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Initializing Widget Management System..."
node scripts/initialize-widget-management.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Widget Management System initialized successfully!"
    echo ""
    echo "🧪 Running tests..."
    node test-widget-management.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Setup completed successfully!"
        echo ""
        echo "📋 What's been created:"
        echo "  ✅ Widget Management content type"
        echo "  ✅ Admin controls component"
        echo "  ✅ Position and size components"
        echo "  ✅ Sponsorship settings component"
        echo "  ✅ API endpoints for widget management"
        echo "  ✅ Default widgets with proper permissions"
        echo "  ✅ Frontend hooks for widget permissions"
        echo ""
        echo "🔗 Available API Endpoints:"
        echo "  GET /api/widget-managements - Get all widgets"
        echo "  GET /api/widget-management/type/:widgetType - Get widget by type"
        echo "  GET /api/widget-management/category/:category - Get widgets by category"
        echo "  GET /api/widget-management/mandatory - Get mandatory widgets"
        echo "  GET /api/widget-management/deletable - Get deletable widgets"
        echo "  PUT /api/widget-management/:id/admin-controls - Update admin controls"
        echo "  PUT /api/widget-management/bulk-admin-controls - Bulk update controls"
        echo "  GET /api/widget-management/permissions-summary - Get permissions summary"
        echo ""
        echo "📖 Documentation:"
        echo "  See WIDGET_MANAGEMENT_GUIDE.md for detailed usage instructions"
        echo ""
        echo "🎯 Use Cases Implemented:"
        echo "  🔒 Ad banners: Locked and mandatory (cannot be resized, moved, or deleted)"
        echo "  ⭐ Core content: Mandatory but resizable (Hot Deals, Breaking News)"
        echo "  🎛️ Niche widgets: Optional and fully customizable (Weather, Radio, etc.)"
        echo ""
        echo "🚀 Ready to use! Start your Strapi server and begin managing widgets."
    else
        echo "❌ Tests failed. Please check the error messages above."
        exit 1
    fi
else
    echo "❌ Initialization failed. Please check the error messages above."
    exit 1
fi
