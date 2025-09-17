#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'https://api.pattaya1.com';

// Test various endpoints to see what's available
const endpoints = [
  '/api/',
  '/api/articles',
  '/api/news-sources', 
  '/api/news-source',
  '/api/breaking-news',
  '/api/news-settings',
  '/api/news-articles',
  '/api/news',
  '/api/content-types',
  '/admin',
  '/admin/content-manager',
  '/admin/api-tokens'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`🔍 Testing: ${API_BASE}${endpoint}`);
    const response = await axios.get(`${API_BASE}${endpoint}`, { 
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.data) {
      if (typeof response.data === 'object') {
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      } else {
        console.log(`   Response: ${response.data.substring(0, 200)}...`);
      }
    }
    console.log('');
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
  }
}

async function main() {
  console.log('🔍 Testing API endpoints at https://api.pattaya1.com\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('✅ Endpoint testing completed');
}

main().catch(console.error);
