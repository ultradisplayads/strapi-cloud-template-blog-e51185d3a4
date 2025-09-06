#!/usr/bin/env node

/**
 * Script to create default news settings in Strapi
 * Run this after starting Strapi to initialize the settings
 */

const axios = require('axios');

async function createDefaultSettings() {
  try {
    console.log('🔧 Creating default news settings...');
    
    // Check if settings already exist
    try {
      const existingSettings = await axios.get('http://localhost:1337/api/news-settings');
      if (existingSettings.data.data) {
        console.log('✅ News settings already exist');
        console.log('Current settings:', JSON.stringify(existingSettings.data.data, null, 2));
        return;
      }
    } catch (error) {
      // Settings don't exist, continue to create them
    }
    
    // Create default settings
    const defaultSettings = {
      data: {
        fetchIntervalMinutes: 30,
        moderationKeywords: ["spam", "fake", "clickbait", "scam", "adult", "explicit"],
        autoModerationEnabled: true,
        maxArticlesPerFetch: 20,
        enableVoting: true,
        cronJobEnabled: true,
        newsApiCountry: "us",
        newsApiCategory: "general",
        maxArticleLimit: 21
      }
    };
    
    const response = await axios.post('http://localhost:1337/api/news-settings', defaultSettings);
    
    console.log('✅ Default news settings created successfully!');
    console.log('Settings:', JSON.stringify(response.data.data, null, 2));
    
  } catch (error) {
    console.error('❌ Failed to create default settings:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the script
createDefaultSettings();
