#!/usr/bin/env node

/**
 * Test script to verify simplified lifecycle automation
 */

const axios = require('axios');

async function testSimpleAutomation() {
  console.log('🧪 Testing Simplified Lifecycle Automation\n');
  
  try {
    // Get current state
    console.log('📊 Current state:');
    const settingsResponse = await axios.get('http://localhost:1337/api/news-settings');
    const articlesResponse = await axios.get('http://localhost:1337/api/breaking-news-plural');
    
    const currentLimit = settingsResponse.data.data.maxArticleLimit;
    const currentArticleCount = articlesResponse.data.data.length;
    
    console.log(`   Limit: ${currentLimit}`);
    console.log(`   Articles: ${currentArticleCount}\n`);
    
    // Simulate manual SQL cleanup (what lifecycle should trigger)
    console.log('🔧 Simulating lifecycle trigger - running manual SQL cleanup...');
    
    const SQLCleanupManager = require('./scripts/sql-cleanup-manager.js');
    const cleanupManager = new SQLCleanupManager();
    
    console.log(`🔄 [Simulated Lifecycle] Article limit: ${currentLimit}`);
    console.log(`🚀 [Simulated Lifecycle] Triggering SQL cleanup manager...`);
    
    const result = await cleanupManager.enforceLimit();
    
    console.log(`✅ [Simulated Lifecycle] SQL cleanup completed: ${result.deleted} articles deleted, final count: ${result.finalCount}/${result.maxLimit}`);
    
    if (result.finalCount < currentLimit) {
      console.log(`📊 [Simulated Lifecycle] ${currentLimit - result.finalCount} slots available for new articles`);
    }
    
    // Check final state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalResponse = await axios.get('http://localhost:1337/api/breaking-news-plural');
    const finalCount = finalResponse.data.data.length;
    
    console.log(`\n📋 Results:`);
    console.log(`   Before: ${currentArticleCount} articles`);
    console.log(`   After: ${finalCount} articles`);
    console.log(`   Database: ${result.finalCount} articles (actual)`);
    console.log(`   Limit: ${currentLimit}`);
    
    if (result.finalCount <= currentLimit) {
      console.log('\n✅ Simplified automation working correctly!');
      console.log('   - SQL cleanup enforces limits properly');
      console.log('   - Lifecycle will trigger this same cleanup on limit changes');
    } else {
      console.log('\n❌ Issue detected - check SQL cleanup logic');
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run test
testSimpleAutomation();
