#!/usr/bin/env node

/**
 * Initialize Dynamic Dashboard Data
 * 
 * This script initializes the database with default widget configurations
 * and sets up the necessary data for the dynamic dashboard system.
 */

const strapi = require('@strapi/strapi');

async function initializeDynamicDashboard() {
  let app;
  
  try {
    console.log('🚀 Initializing Dynamic Dashboard...');
    
    // Initialize Strapi
    //@ts-ignore
    app = await strapi();
    await app.start();
    
    // Default admin widget configurations
    const defaultWidgetConfigs = {
      "weather": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
      "breaking-news": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
      "radio": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "hot-deals": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
      "news-hero": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
      "business-spotlight": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "social-feed": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "trending": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "youtube": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "events-calendar": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "quick-links": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "photo-gallery": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "forum-activity": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "google-reviews": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "curator-social": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
      "traffic": { "allowResize": false, "allowDrag": false, "allowDelete": false, "isLocked": true }
    };

    // Check if admin widget configs already exist
    const existingConfigs = await app.entityService.findMany('api::admin-widget-configs.admin-widget-configs');
    
    if (existingConfigs.length === 0) {
      console.log('📝 Creating default admin widget configurations...');
      
      await app.entityService.create('api::admin-widget-configs.admin-widget-configs', {
        data: {
          widgetConfigs: defaultWidgetConfigs,
          lastUpdated: new Date()
        }
      });
      
      console.log('✅ Admin widget configurations created successfully');
    } else {
      console.log('ℹ️  Admin widget configurations already exist, skipping...');
    }

    // Check if widget control already exists
    const existingWidgetControl = await app.entityService.findMany('api::widget-control.widget-control');
    
    if (existingWidgetControl.length === 0) {
      console.log('📝 Creating default widget control...');
      
      await app.entityService.create('api::widget-control.widget-control', {
        data: {
          WidgetTitle: 'Pattaya Breaking News',
          NumberOfArticles: 5,
          UpdateFrequencyMinutes: 5,
          ShowVotingButtons: true,
          ShowSourceNames: true,
          ShowTimestamps: true,
          EnableAutoRefresh: true,
          WidgetTheme: 'light',
          AdminSettings: {
            allowResize: true,
            allowDrag: true,
            allowDelete: false,
            isLocked: false
          }
        }
      });
      
      console.log('✅ Widget control created successfully');
    } else {
      console.log('ℹ️  Widget control already exists, skipping...');
    }

    console.log('🎉 Dynamic Dashboard initialization completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Restart your Strapi backend');
    console.log('2. Set up proper permissions in Strapi admin panel');
    console.log('3. Test the API endpoints');
    console.log('4. Configure authentication in your frontend');
    
  } catch (error) {
    console.error('❌ Error initializing Dynamic Dashboard:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.destroy();
    }
    process.exit(0);
  }
}

// Run the initialization
initializeDynamicDashboard();
