#!/usr/bin/env node

/**
 * Deep Status Update Testing Suite
 * Comprehensive testing of all status update methods and edge cases
 */

const axios = require('axios');

const BASE_URL = 'http://locahost:1337';
const VALID_STATUSES = ['pending', 'active', 'rejected', 'archived'];
const TEST_VIDEO_ID = 13; // Using the video we know exists
const TEST_DOCUMENT_ID = 's13zhrq2a51z3whcb6t6bt6g';

class DeepStatusTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Deep Status Update Testing Suite');
    console.log('============================================\n');

    // Test 1: Schema Validation Tests
    await this.testSchemaConsistency();
    
    // Test 2: API Endpoint Tests
    await this.testAllAPIEndpoints();
    
    // Test 3: Status Transition Tests
    await this.testAllStatusTransitions();
    
    // Test 4: Edge Case Tests
    await this.testEdgeCases();
    
    // Test 5: Validation Error Tests
    await this.testValidationErrors();
    
    // Test 6: Concurrent Update Tests
    await this.testConcurrentUpdates();
    
    // Test 7: Data Integrity Tests
    await this.testDataIntegrity();

    this.printResults();
  }

  async testSchemaConsistency() {
    console.log('📋 Testing Schema Consistency');
    console.log('============================');

    try {
      // Get video data and check schema compliance
      const response = await axios.get(`${BASE_URL}/api/videos/${TEST_DOCUMENT_ID}`);
      const video = response.data.data;
      
      this.assert(
        VALID_STATUSES.includes(video.status),
        'Schema Consistency',
        `Video status "${video.status}" is valid according to schema`,
        `Invalid status found: ${video.status}`
      );

      // Check if all required fields are present
      const requiredFields = ['video_id', 'title', 'thumbnail_url', 'channel_name'];
      for (const field of requiredFields) {
        this.assert(
          video[field] !== undefined && video[field] !== null,
          'Required Fields',
          `Required field "${field}" is present`,
          `Missing required field: ${field}`
        );
      }

      // Check if status has default value behavior
      this.assert(
        video.status !== undefined,
        'Default Status',
        'Status field has a value (default or set)',
        'Status field is undefined'
      );

    } catch (error) {
      this.assert(false, 'Schema Consistency', '', `Failed to fetch video: ${error.message}`);
    }
  }

  async testAllAPIEndpoints() {
    console.log('\n🔗 Testing All API Endpoints');
    console.log('============================');

    const endpoints = [
      {
        name: 'Standard Strapi API (Document ID)',
        method: 'PUT',
        url: `${BASE_URL}/api/videos/${TEST_DOCUMENT_ID}`,
        data: { data: { status: 'pending' } }
      },
      {
        name: 'Custom Moderation API (Regular ID)',
        method: 'PUT',
        url: `${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`,
        data: { status: 'active', reason: 'Test update' }
      },
      {
        name: 'Bulk Update API',
        method: 'PUT',
        url: `${BASE_URL}/api/featured-videos/moderation/bulk-status`,
        data: { videoIds: [TEST_VIDEO_ID], status: 'rejected', reason: 'Bulk test' }
      }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          data: endpoint.data,
          headers: { 'Content-Type': 'application/json' }
        });

        this.assert(
          response.status === 200,
          endpoint.name,
          `Endpoint responded with status ${response.status}`,
          `Endpoint failed with status ${response.status}`
        );

        // Verify response structure
        const hasSuccess = response.data.success !== undefined || response.data.data !== undefined;
        this.assert(
          hasSuccess,
          `${endpoint.name} Response`,
          'Response has expected structure',
          'Response missing success/data fields'
        );

      } catch (error) {
        this.assert(
          false,
          endpoint.name,
          '',
          `Endpoint failed: ${error.response?.data?.error || error.message}`
        );
      }
    }
  }

  async testAllStatusTransitions() {
    console.log('\n🔄 Testing All Status Transitions');
    console.log('=================================');

    const transitions = [
      { from: 'pending', to: 'active' },
      { from: 'active', to: 'rejected' },
      { from: 'rejected', to: 'archived' },
      { from: 'archived', to: 'pending' }
    ];

    for (const transition of transitions) {
      try {
        // Set initial status
        await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
          status: transition.from,
          reason: `Setting to ${transition.from} for transition test`
        });

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));

        // Perform transition
        const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
          status: transition.to,
          reason: `Transition test: ${transition.from} → ${transition.to}`
        });

        this.assert(
          response.data.success,
          `Transition ${transition.from} → ${transition.to}`,
          'Status transition completed successfully',
          `Transition failed: ${response.data.error}`
        );

        // Verify the change
        const verifyResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${TEST_VIDEO_ID}`);
        const updatedVideo = verifyResponse.data.data[0];

        this.assert(
          updatedVideo.status === transition.to,
          `Verify ${transition.from} → ${transition.to}`,
          `Status correctly updated to ${transition.to}`,
          `Status is ${updatedVideo.status}, expected ${transition.to}`
        );

      } catch (error) {
        this.assert(
          false,
          `Transition ${transition.from} → ${transition.to}`,
          '',
          `Transition failed: ${error.response?.data?.error || error.message}`
        );
      }
    }
  }

  async testEdgeCases() {
    console.log('\n🎯 Testing Edge Cases');
    console.log('=====================');

    // Test 1: Empty status (should fail)
    try {
      const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
        status: '',
        reason: 'Empty status test'
      });
      
      this.assert(
        !response.data.success,
        'Empty Status',
        'Empty status correctly rejected',
        'Empty status was accepted (should fail)'
      );
    } catch (error) {
      this.assert(
        true,
        'Empty Status',
        'Empty status correctly rejected with error',
        ''
      );
    }

    // Test 2: Invalid status (should fail)
    try {
      const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
        status: 'invalid_status',
        reason: 'Invalid status test'
      });
      
      this.assert(
        !response.data.success,
        'Invalid Status',
        'Invalid status correctly rejected',
        'Invalid status was accepted (should fail)'
      );
    } catch (error) {
      this.assert(
        true,
        'Invalid Status',
        'Invalid status correctly rejected with error',
        ''
      );
    }

    // Test 3: Non-existent video ID
    try {
      const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/99999`, {
        status: 'active',
        reason: 'Non-existent video test'
      });
      
      this.assert(
        !response.data.success,
        'Non-existent Video',
        'Non-existent video correctly rejected',
        'Non-existent video was accepted (should fail)'
      );
    } catch (error) {
      this.assert(
        true,
        'Non-existent Video',
        'Non-existent video correctly rejected with error',
        ''
      );
    }

    // Test 4: Case sensitivity
    try {
      const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
        status: 'ACTIVE',
        reason: 'Case sensitivity test'
      });
      
      // Should either work (case insensitive) or fail (case sensitive)
      const verifyResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${TEST_VIDEO_ID}`);
      const video = verifyResponse.data.data[0];
      
      this.assert(
        video.status === 'active' || !response.data.success,
        'Case Sensitivity',
        'Case sensitivity handled correctly',
        `Unexpected behavior with uppercase status: ${video.status}`
      );
    } catch (error) {
      this.assert(
        true,
        'Case Sensitivity',
        'Uppercase status correctly rejected',
        ''
      );
    }
  }

  async testValidationErrors() {
    console.log('\n❌ Testing Validation Errors');
    console.log('============================');

    const invalidRequests = [
      {
        name: 'Missing Status Field',
        data: { reason: 'Missing status test' },
        shouldFail: true
      },
      {
        name: 'Null Status',
        data: { status: null, reason: 'Null status test' },
        shouldFail: true
      },
      {
        name: 'Numeric Status',
        data: { status: 123, reason: 'Numeric status test' },
        shouldFail: true
      },
      {
        name: 'Array Status',
        data: { status: ['active'], reason: 'Array status test' },
        shouldFail: true
      }
    ];

    for (const test of invalidRequests) {
      try {
        const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, test.data);
        
        this.assert(
          !response.data.success === test.shouldFail,
          test.name,
          test.shouldFail ? 'Invalid request correctly rejected' : 'Valid request accepted',
          test.shouldFail ? 'Invalid request was accepted' : 'Valid request was rejected'
        );
      } catch (error) {
        this.assert(
          test.shouldFail,
          test.name,
          'Invalid request correctly rejected with error',
          `Unexpected error: ${error.message}`
        );
      }
    }
  }

  async testConcurrentUpdates() {
    console.log('\n⚡ Testing Concurrent Updates');
    console.log('=============================');

    try {
      // Perform multiple concurrent updates
      const promises = [
        axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
          status: 'active',
          reason: 'Concurrent test 1'
        }),
        axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
          status: 'pending',
          reason: 'Concurrent test 2'
        }),
        axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
          status: 'rejected',
          reason: 'Concurrent test 3'
        })
      ];

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;

      this.assert(
        successCount > 0,
        'Concurrent Updates',
        `${successCount}/3 concurrent updates succeeded`,
        'All concurrent updates failed'
      );

      // Verify final state is consistent
      const verifyResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${TEST_VIDEO_ID}`);
      const finalVideo = verifyResponse.data.data[0];

      this.assert(
        VALID_STATUSES.includes(finalVideo.status),
        'Concurrent Update Consistency',
        `Final status "${finalVideo.status}" is valid`,
        `Final status "${finalVideo.status}" is invalid`
      );

    } catch (error) {
      this.assert(false, 'Concurrent Updates', '', `Concurrent update test failed: ${error.message}`);
    }
  }

  async testDataIntegrity() {
    console.log('\n🔒 Testing Data Integrity');
    console.log('=========================');

    try {
      // Get initial state
      const initialResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${TEST_VIDEO_ID}`);
      const initialVideo = initialResponse.data.data[0];

      // Perform status update
      await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${TEST_VIDEO_ID}`, {
        status: 'active',
        reason: 'Data integrity test'
      });

      // Verify data integrity
      const updatedResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${TEST_VIDEO_ID}`);
      const updatedVideo = updatedResponse.data.data[0];

      // Check that only status-related fields changed
      const unchangedFields = ['video_id', 'title', 'thumbnail_url', 'channel_name', 'description'];
      for (const field of unchangedFields) {
        this.assert(
          initialVideo[field] === updatedVideo[field],
          `Data Integrity - ${field}`,
          `Field "${field}" remained unchanged`,
          `Field "${field}" was unexpectedly modified`
        );
      }

      // Check that moderation fields were updated
      this.assert(
        updatedVideo.moderated_at !== initialVideo.moderated_at,
        'Moderation Timestamp',
        'moderated_at was updated',
        'moderated_at was not updated'
      );

      this.assert(
        updatedVideo.moderated_by !== undefined,
        'Moderation User',
        'moderated_by was set',
        'moderated_by was not set'
      );

    } catch (error) {
      this.assert(false, 'Data Integrity', '', `Data integrity test failed: ${error.message}`);
    }
  }

  assert(condition, testName, successMessage, failureMessage) {
    const result = {
      name: testName,
      passed: condition,
      message: condition ? successMessage : failureMessage
    };

    this.results.tests.push(result);
    
    if (condition) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${successMessage}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${failureMessage}`);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   • ${test.name}: ${test.message}`));
    }

    console.log('\n🎯 Test Recommendations:');
    if (this.results.failed === 0) {
      console.log('   ✅ All tests passed! Status update system is working correctly.');
      console.log('   ✅ Admin panel should work without validation errors.');
    } else {
      console.log('   ⚠️  Some tests failed. Review the failed tests above.');
      console.log('   ⚠️  Admin panel may still have validation issues.');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DeepStatusTester();
  tester.runAllTests().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

module.exports = DeepStatusTester;
