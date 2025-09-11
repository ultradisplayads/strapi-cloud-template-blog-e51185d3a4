#!/usr/bin/env node

/**
 * Initialize Widget Management System
 * 
 * This script initializes the widget management system with default widgets
 * and their admin controls.
 */

const strapi = require('@strapi/strapi');

async function initializeWidgetManagement() {
  try {
    console.log('🚀 Initializing Widget Management System...');
    
    // Initialize Strapi
    const app = await strapi().load();
    
    // Get the widget management service
    const widgetService = app.service('api::widget-management.widget-management');
    
    // Initialize default widgets
    console.log('📦 Creating default widgets...');
    await widgetService.initializeDefaultWidgets();
    
    // Get all widgets to verify
    const widgets = await app.entityService.findMany('api::widget-management.widget-management', {
      populate: ['adminControls', 'defaultPosition', 'defaultSize']
    });
    
    console.log(`✅ Successfully initialized ${widgets.length} widgets:`);
    
    widgets.forEach(widget => {
      const controls = widget.adminControls;
      console.log(`  - ${widget.displayName} (${widget.widgetType})`);
      console.log(`    Category: ${widget.category}`);
      console.log(`    Mandatory: ${controls?.isMandatory ? '✅' : '❌'}`);
      console.log(`    Deletable: ${controls?.canBeDeleted ? '✅' : '❌'}`);
      console.log(`    Resizable: ${controls?.allowUserResizing ? '✅' : '❌'}`);
      console.log(`    Movable: ${controls?.allowUserMoving ? '✅' : '❌'}`);
      console.log(`    Locked: ${controls?.isLocked ? '🔒' : '🔓'}`);
      console.log('');
    });
    
    // Create permissions summary
    const summary = {
      total: widgets.length,
      mandatory: widgets.filter(w => w.adminControls?.isMandatory).length,
      deletable: widgets.filter(w => w.adminControls?.canBeDeleted).length,
      resizable: widgets.filter(w => w.adminControls?.allowUserResizing).length,
      movable: widgets.filter(w => w.adminControls?.allowUserMoving).length,
      locked: widgets.filter(w => w.adminControls?.isLocked).length
    };
    
    console.log('📊 Widget Permissions Summary:');
    console.log(`  Total Widgets: ${summary.total}`);
    console.log(`  Mandatory: ${summary.mandatory}`);
    console.log(`  Deletable: ${summary.deletable}`);
    console.log(`  Resizable: ${summary.resizable}`);
    console.log(`  Movable: ${summary.movable}`);
    console.log(`  Locked: ${summary.locked}`);
    
    console.log('\n🎉 Widget Management System initialized successfully!');
    console.log('\n📋 Available API Endpoints:');
    console.log('  GET /api/widget-managements - Get all widgets');
    console.log('  GET /api/widget-management/type/:widgetType - Get widget by type');
    console.log('  GET /api/widget-management/category/:category - Get widgets by category');
    console.log('  GET /api/widget-management/mandatory - Get mandatory widgets');
    console.log('  GET /api/widget-management/deletable - Get deletable widgets');
    console.log('  PUT /api/widget-management/:id/admin-controls - Update admin controls');
    console.log('  PUT /api/widget-management/bulk-admin-controls - Bulk update controls');
    console.log('  GET /api/widget-management/permissions-summary - Get permissions summary');
    
    await app.destroy();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error initializing widget management system:', error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeWidgetManagement();
