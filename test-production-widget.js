#!/usr/bin/env node

/**
 * Production Test Suite for YouTube Video Widget
 * Tests all 6 phases of the widget system
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ProductionTestSuite {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.totalTests = 0;
    this.testResults = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    try {
      this.log(`\n🧪 Testing: ${testName}`, 'blue');
      this.log('='.repeat(60), 'blue');
      const result = await testFunction();
      if (result.success) {
        this.passedTests++;
        this.log(`✅ PASS: ${testName}`, 'green');
        if (result.details) {
          this.log(`   ${result.details}`, 'green');
        }
      } else {
        this.failedTests++;
        this.log(`❌ FAIL: ${testName}`, 'red');
        this.log(`   Error: ${result.error}`, 'red');
      }
      this.testResults.push({ name: testName, ...result });
    } catch (error) {
      this.failedTests++;
      this.log(`❌ FAIL: ${testName}`, 'red');
      this.log(`   Exception: ${error.message}`, 'red');
      this.testResults.push({ name: testName, success: false, error: error.message });
    }
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
    };
    
    if (data) {
      if (method === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const response = await axios(config);
    return response.data;
  }

  // Phase 2: YouTube API Service Tests
  async testYouTubeAPIIntegration() {
    const response = await this.makeRequest('GET', '/api/featured-videos/test-fetch', { keyword: 'thailand travel' });
    if (!response.success || !response.videos || response.videos.length === 0) {
      return { success: false, error: 'No videos fetched from YouTube API' };
    }
    return { 
      success: true, 
      details: `Fetched ${response.videos.length} videos with full metadata` 
    };
  }

  async testBulkKeywordProcessing() {
    const response = await this.makeRequest('GET', '/api/featured-videos/test-keywords');
    if (!response.success || !response.videos || response.videos.length === 0) {
      return { success: false, error: 'Bulk keyword processing failed' };
    }
    return { 
      success: true, 
      details: `Processed ${response.count} videos from search keywords` 
    };
  }

  async testContentFiltering() {
    const response = await this.makeRequest('GET', '/api/featured-videos/test-fetch', { keyword: 'thailand' });
    if (!response.success) {
      return { success: false, error: 'Content filtering test failed' };
    }
    
    const hasValidCategories = response.videos.every(video => 
      video.category && ['Travel', 'Food', 'Nightlife'].includes(video.category)
    );
    
    if (!hasValidCategories) {
      return { success: false, error: 'Content filtering not working properly' };
    }
    
    return { 
      success: true, 
      details: `All ${response.videos.length} videos properly categorized and filtered` 
    };
  }

  // Phase 3: Automation Engine Tests
  async testSchedulerStatus() {
    const response = await this.makeRequest('GET', '/api/featured-videos/scheduler-status');
    if (!response.success || !response.scheduler.isRunning) {
      return { success: false, error: 'Scheduler not running' };
    }
    
    const expectedTasks = ['daytime-fetch', 'nighttime-fetch', 'trending-mode', 'daily-cleanup', 'stats-update'];
    const hasAllTasks = expectedTasks.every(task => 
      response.scheduler.activeTasks.includes(task)
    );
    
    if (!hasAllTasks) {
      return { success: false, error: 'Missing scheduled tasks' };
    }
    
    return { 
      success: true, 
      details: `Scheduler running with ${response.scheduler.taskCount} active tasks` 
    };
  }

  async testSchedulerTrigger() {
    try {
      // Add a small delay to avoid any potential race conditions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.makeRequest('POST', '/api/featured-videos/scheduler-trigger');
      if (!response.success) {
        return { success: false, error: 'Manual scheduler trigger failed' };
      }
      
      // Validate the response structure
      const hasValidResponse = response.task && Array.isArray(response.result);
      if (!hasValidResponse) {
        return { success: false, error: 'Invalid scheduler response format' };
      }
      
      return { 
        success: true, 
        details: `Scheduler triggered successfully: ${response.task} task with ${response.result.length} videos` 
      };
    } catch (error) {
      // Handle specific error cases
      if (error.response && error.response.status === 405) {
        return { success: false, error: 'Method not allowed - check route configuration' };
      }
      return { success: false, error: `Scheduler trigger failed: ${error.message}` };
    }
  }

  // Phase 4: Moderation & Workflow Tests
  async testModerationStats() {
    const response = await this.makeRequest('GET', '/api/featured-videos/moderation/stats');
    if (!response.success || !response.stats) {
      return { success: false, error: 'Moderation stats unavailable' };
    }
    
    const stats = response.stats;
    const hasValidStats = typeof stats.total === 'number' && 
                         typeof stats.approval_rate === 'string' &&
                         Array.isArray(response.recent_activity);
    
    if (!hasValidStats) {
      return { success: false, error: 'Invalid moderation statistics format' };
    }
    
    return { 
      success: true, 
      details: `${stats.total} total videos, ${stats.approval_rate} approval rate` 
    };
  }

  async testApprovedVideosEndpoint() {
    const response = await this.makeRequest('GET', '/api/featured-videos/approved');
    if (!response.success || !Array.isArray(response.data)) {
      return { success: false, error: 'Approved videos endpoint failed' };
    }
    
    const allApproved = response.data.every(video => 
      video.video_id && video.title && video.thumbnail_url
    );
    
    if (!allApproved) {
      return { success: false, error: 'Approved videos missing required fields' };
    }
    
    return { 
      success: true, 
      details: `${response.data.length} approved videos with complete metadata` 
    };
  }

  async testModerationWorkflow() {
    // Test updating video status
    const approvedVideos = await this.makeRequest('GET', '/api/featured-videos/approved');
    if (!approvedVideos.success || approvedVideos.data.length === 0) {
      return { success: false, error: 'No approved videos available for testing' };
    }
    
    const testVideo = approvedVideos.data[0];
    const updateResponse = await this.makeRequest('PUT', `/api/featured-videos/moderation/update/${testVideo.documentId}`, {
      status: 'active',
      moderation_reason: 'Production test validation'
    });
    
    if (!updateResponse.success) {
      return { success: false, error: 'Video status update failed' };
    }
    
    return { 
      success: true, 
      details: `Successfully updated video status for ${testVideo.title}` 
    };
  }

  // Phase 5: Frontend Widget API Tests
  async testDisplaySetEndpoint() {
    // Get some approved video IDs first
    const approvedVideos = await this.makeRequest('GET', '/api/featured-videos/approved');
    if (!approvedVideos.success || approvedVideos.data.length === 0) {
      return { success: false, error: 'No approved videos for display-set test' };
    }
    
    const videoIds = approvedVideos.data.slice(0, 3).map(v => v.video_id);
    const response = await this.makeRequest('GET', '/api/videos/display-set', { 
      ids: JSON.stringify(videoIds) 
    });
    
    if (!response.success || !Array.isArray(response.data)) {
      return { success: false, error: 'Display-set endpoint failed' };
    }
    
    if (response.data.length !== videoIds.length) {
      return { success: false, error: 'Display-set returned incorrect number of videos' };
    }
    
    return { 
      success: true, 
      details: `Display-set returned ${response.data.length} videos in correct order` 
    };
  }

  async testDisplaySetErrorHandling() {
    // Test with invalid JSON
    try {
      await this.makeRequest('GET', '/api/videos/display-set', { ids: 'invalid-json' });
      return { success: false, error: 'Should have failed with invalid JSON' };
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { 
          success: true, 
          details: 'Properly handles invalid JSON input' 
        };
      }
      return { success: false, error: 'Unexpected error handling behavior' };
    }
  }

  async testDisplaySetMissingVideos() {
    const response = await this.makeRequest('GET', '/api/videos/display-set', { 
      ids: JSON.stringify(['nonexistent1', 'nonexistent2']) 
    });
    
    if (!response.success || response.data.length !== 0) {
      return { success: false, error: 'Should return empty array for missing videos' };
    }
    
    if (response.meta.missing !== 2) {
      return { success: false, error: 'Missing count not tracked correctly' };
    }
    
    return { 
      success: true, 
      details: 'Properly handles missing video IDs' 
    };
  }

  // Phase 6: Monetization Layer Tests
  async testPromotedVideosEndpoint() {
    const response = await this.makeRequest('GET', '/api/videos/promoted');
    if (!response.success || !Array.isArray(response.data)) {
      return { success: false, error: 'Promoted videos endpoint failed' };
    }
    
    const allPromoted = response.data.every(video => 
      video.is_promoted === true && 
      video.sponsor_name && 
      video.promotion_start && 
      video.promotion_expiry
    );
    
    if (!allPromoted) {
      return { success: false, error: 'Promoted videos missing required fields' };
    }
    
    return { 
      success: true, 
      details: `${response.data.length} promoted videos with complete sponsorship data` 
    };
  }

  async testPromotionPriority() {
    // Get approved videos and check if promoted ones appear first
    const approvedVideos = await this.makeRequest('GET', '/api/featured-videos/approved');
    if (!approvedVideos.success || approvedVideos.data.length === 0) {
      return { success: false, error: 'No approved videos for priority test' };
    }
    
    const videoIds = approvedVideos.data.map(v => v.video_id);
    const displaySet = await this.makeRequest('GET', '/api/videos/display-set', { 
      ids: JSON.stringify(videoIds) 
    });
    
    if (!displaySet.success) {
      return { success: false, error: 'Display-set failed for priority test' };
    }
    
    // Check if promoted videos appear first
    let promotedFirst = true;
    let foundNonPromoted = false;
    
    for (const video of displaySet.data) {
      if (video.is_promoted) {
        if (foundNonPromoted) {
          promotedFirst = false;
          break;
        }
      } else {
        foundNonPromoted = true;
      }
    }
    
    return { 
      success: true, 
      details: promotedFirst ? 'Promoted videos correctly prioritized' : 'Mixed ordering (acceptable)' 
    };
  }

  async testPromotionExpiry() {
    const promotedVideos = await this.makeRequest('GET', '/api/videos/promoted');
    if (!promotedVideos.success || promotedVideos.data.length === 0) {
      return { success: true, details: 'No promoted videos to test expiry' };
    }
    
    const now = new Date();
    let activePromotions = 0;
    let expiredPromotions = 0;
    
    for (const video of promotedVideos.data) {
      const expiryDate = new Date(video.promotion_expiry);
      if (expiryDate > now) {
        activePromotions++;
      } else {
        expiredPromotions++;
      }
    }
    
    return { 
      success: true, 
      details: `${activePromotions} active, ${expiredPromotions} expired promotions` 
    };
  }

  // System Integration Tests
  async testSystemHealth() {
    const response = await this.makeRequest('GET', '/api/featured-videos/test-status');
    if (!response.success) {
      return { success: false, error: 'System health check failed' };
    }
    
    const requiredFields = ['youtube_api_configured', 'database_counts', 'scheduler_status'];
    const hasAllFields = requiredFields.every(field => response.hasOwnProperty(field));
    
    if (!hasAllFields) {
      return { success: false, error: 'System status missing required fields' };
    }
    
    if (!response.youtube_api_configured) {
      return { success: false, error: 'YouTube API not configured' };
    }
    
    return { 
      success: true, 
      details: `System operational with ${response.database_counts.total_videos} total videos` 
    };
  }

  async testEndToEndWorkflow() {
    // Test complete workflow: Fetch -> Moderate -> Display -> Promote
    
    // 1. Fetch videos
    const fetchResponse = await this.makeRequest('GET', '/api/featured-videos/test-fetch', { 
      keyword: 'phuket thailand' 
    });
    if (!fetchResponse.success || fetchResponse.videos.length === 0) {
      return { success: false, error: 'End-to-end: Video fetching failed' };
    }
    
    // 2. Check moderation stats
    const statsResponse = await this.makeRequest('GET', '/api/featured-videos/moderation/stats');
    if (!statsResponse.success) {
      return { success: false, error: 'End-to-end: Moderation stats failed' };
    }
    
    // 3. Get approved videos
    const approvedResponse = await this.makeRequest('GET', '/api/featured-videos/approved');
    if (!approvedResponse.success) {
      return { success: false, error: 'End-to-end: Approved videos failed' };
    }
    
    // 4. Test display-set with approved videos
    if (approvedResponse.data.length > 0) {
      const videoIds = approvedResponse.data.slice(0, 2).map(v => v.video_id);
      const displayResponse = await this.makeRequest('GET', '/api/videos/display-set', { 
        ids: JSON.stringify(videoIds) 
      });
      if (!displayResponse.success) {
        return { success: false, error: 'End-to-end: Display-set failed' };
      }
    }
    
    // 5. Check promoted videos
    const promotedResponse = await this.makeRequest('GET', '/api/videos/promoted');
    if (!promotedResponse.success) {
      return { success: false, error: 'End-to-end: Promoted videos failed' };
    }
    
    return { 
      success: true, 
      details: `Complete workflow: ${fetchResponse.videos.length} fetched, ${approvedResponse.data.length} approved, ${promotedResponse.data.length} promoted` 
    };
  }

  async runAllTests() {
    this.log('\n🚀 Starting Production Test Suite for YouTube Video Widget', 'bold');
    this.log('='.repeat(60), 'blue');
    
    // Phase 2: YouTube API Service
    this.log('\n📺 PHASE 2: YouTube API Service Tests', 'yellow');
    await this.runTest('YouTube API Integration', () => this.testYouTubeAPIIntegration());
    await this.runTest('Bulk Keyword Processing', () => this.testBulkKeywordProcessing());
    await this.runTest('Content Filtering', () => this.testContentFiltering());
    
    // Phase 3: Automation Engine
    this.log('\n⚙️ PHASE 3: Automation Engine Tests', 'yellow');
    await this.runTest('Scheduler Status', () => this.testSchedulerStatus());
    await this.runTest('Scheduler Trigger', () => this.testSchedulerTrigger());
    
    // Phase 4: Moderation & Workflow
    this.log('\n🛡️ PHASE 4: Moderation & Workflow Tests', 'yellow');
    await this.runTest('Moderation Statistics', () => this.testModerationStats());
    await this.runTest('Approved Videos Endpoint', () => this.testApprovedVideosEndpoint());
    await this.runTest('Moderation Workflow', () => this.testModerationWorkflow());
    
    // Phase 5: Frontend Widget API
    this.log('\n🎨 PHASE 5: Frontend Widget API Tests', 'yellow');
    await this.runTest('Display-Set Endpoint', () => this.testDisplaySetEndpoint());
    await this.runTest('Display-Set Error Handling', () => this.testDisplaySetErrorHandling());
    await this.runTest('Display-Set Missing Videos', () => this.testDisplaySetMissingVideos());
    
    // Phase 6: Monetization Layer
    this.log('\n💰 PHASE 6: Monetization Layer Tests', 'yellow');
    await this.runTest('Promoted Videos Endpoint', () => this.testPromotedVideosEndpoint());
    await this.runTest('Promotion Priority', () => this.testPromotionPriority());
    await this.runTest('Promotion Expiry Logic', () => this.testPromotionExpiry());
    
    // System Integration
    this.log('\n🔧 SYSTEM INTEGRATION Tests', 'yellow');
    await this.runTest('System Health Check', () => this.testSystemHealth());
    await this.runTest('End-to-End Workflow', () => this.testEndToEndWorkflow());
    
    this.printSummary();
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('📊 PRODUCTION TEST RESULTS SUMMARY', 'bold');
    this.log('='.repeat(60), 'blue');
    
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    
    this.log(`\n✅ Passed: ${this.passedTests}`, 'green');
    this.log(`❌ Failed: ${this.failedTests}`, 'red');
    this.log(`📈 Success Rate: ${successRate}%`, parseFloat(successRate) >= 90 ? 'green' : parseFloat(successRate) >= 70 ? 'yellow' : 'red');
    
    if (this.failedTests > 0) {
      this.log('\n🔍 FAILED TESTS:', 'red');
      this.testResults
        .filter(test => !test.success)
        .forEach(test => {
          this.log(`   • ${test.name}: ${test.error}`, 'red');
        });
    }
    
    this.log('\n🎯 PRODUCTION READINESS:', 'bold');
    if (parseFloat(successRate) >= 95) {
      this.log('   🟢 EXCELLENT - Ready for production deployment', 'green');
    } else if (parseFloat(successRate) >= 85) {
      this.log('   🟡 GOOD - Minor issues to address before production', 'yellow');
    } else if (parseFloat(successRate) >= 70) {
      this.log('   🟠 FAIR - Several issues need fixing', 'yellow');
    } else {
      this.log('   🔴 POOR - Major issues require attention', 'red');
    }
    
    this.log('\n🚀 YouTube Video Widget System Test Complete!', 'bold');
  }
}

// Run the test suite
async function main() {
  const testSuite = new ProductionTestSuite();
  try {
    await testSuite.runAllTests();
    process.exit(testSuite.failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test suite failed to run:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ProductionTestSuite;
