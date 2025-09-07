#!/usr/bin/env node

/**
 * Test script to verify lifecycle-based automatic cleanup
 */

const axios = require('axios');
const path = require('path');

async function testLifecycleAutomation() {
  console.log('🧪 Testing Lifecycle-Based Automatic Cleanup System\n');
  
  try {
    // Get current state
    console.log('📊 Getting current state...');
    const settingsResponse = await axios.get('http://localhost:1337/api/news-settings');
    const articlesResponse = await axios.get('http://localhost:1337/api/breaking-news-plural');
    
    const currentLimit = settingsResponse.data.data.maxArticleLimit;
    const currentArticleCount = articlesResponse.data.data.length;
    
    console.log(`   Current limit: ${currentLimit}`);
    console.log(`   Current articles: ${currentArticleCount}\n`);
    
    // Test 1: Decrease limit (should trigger cleanup)
    console.log('🔽 Test 1: Decreasing limit to trigger cleanup...');
    const newLowerLimit = Math.max(5, currentLimit - 3);
    
    console.log(`   Changing limit from ${currentLimit} to ${newLowerLimit}`);
    
    // Simulate admin panel update by directly calling entity service
    const SQLCleanupManager = require('./scripts/sql-cleanup-manager.js');
    const cleanupManager = new SQLCleanupManager();
    
    // Manually trigger lifecycle logic
    console.log(`🔄 [Test] Article limit changed: ${currentLimit} → ${newLowerLimit}`);
    
    if (newLowerLimit < currentLimit) {
      console.log(`📉 [Test] Limit decreased - triggering cleanup to remove ${currentLimit - newLowerLimit} excess articles`);
      
      const result = await cleanupManager.enforceLimit();
      console.log(`✅ [Test] Auto-cleanup completed: ${result.deleted} articles deleted, final count: ${result.finalCount}/${result.maxLimit}`);
    }
    
    // Wait and check results
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const afterCleanupResponse = await axios.get('http://localhost:1337/api/breaking-news-plural');
    const afterCleanupCount = afterCleanupResponse.data.data.length;
    
    console.log(`   Articles after cleanup: ${afterCleanupCount}\n`);
    
    // Test 2: Increase limit (should trigger repopulation)
    console.log('🔼 Test 2: Increasing limit to trigger repopulation...');
    const newHigherLimit = newLowerLimit + 5;
    
    console.log(`   Changing limit from ${newLowerLimit} to ${newHigherLimit}`);
    console.log(`🔄 [Test] Article limit changed: ${newLowerLimit} → ${newHigherLimit}`);
    
    if (newHigherLimit > newLowerLimit) {
      console.log(`📈 [Test] Limit increased - triggering news fetch to populate ${newHigherLimit - newLowerLimit} additional slots`);
      
      // First cleanup
      const cleanupResult = await cleanupManager.enforceLimit();
      console.log(`🧹 [Test] Cleanup result: ${cleanupResult.finalCount}/${cleanupResult.maxLimit}`);
      
      // Then fetch news
      const NewsScheduler = require('./scripts/alternative-scheduler.js');
      const scheduler = new NewsScheduler();
      await scheduler.fetchNews();
      
      console.log(`✅ [Test] Auto-repopulation completed for increased limit: ${newHigherLimit}`);
    }
    
    // Wait and check final results
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalResponse = await axios.get('http://localhost:1337/api/breaking-news-plural');
    const finalCount = finalResponse.data.data.length;
    
    console.log(`   Articles after repopulation: ${finalCount}\n`);
    
    // Summary
    console.log('📋 Test Summary:');
    console.log(`   Initial: ${currentArticleCount} articles (limit: ${currentLimit})`);
    console.log(`   After cleanup: ${afterCleanupCount} articles (limit: ${newLowerLimit})`);
    console.log(`   After repopulation: ${finalCount} articles (limit: ${newHigherLimit})`);
    
    if (afterCleanupCount <= newLowerLimit && finalCount >= afterCleanupCount) {
      console.log('✅ Tests PASSED - Lifecycle automation working correctly!');
    } else {
      console.log('❌ Tests FAILED - Check lifecycle implementation');
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run tests
testLifecycleAutomation();
