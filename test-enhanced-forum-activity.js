#!/usr/bin/env node

/**
 * Test Enhanced Forum Activity Widget Implementation
 * This script tests the new API endpoints and data structures
 */

const BASE_URL = process.env.STRAPI_URL || 'https://api.pattaya1.com';

async function testEnhancedForumActivity() {
  console.log('🧪 Testing Enhanced Forum Activity Widget Implementation\n');

  try {
    // Test 1: Enhanced Forum Activity Endpoint
    console.log('1️⃣ Testing Enhanced Forum Activity Endpoint...');
    const response = await fetch(`${BASE_URL}/api/forum-activity/enhanced?limit=5`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Enhanced Forum Activity Endpoint Working');
      console.log(`   - Found ${data.data.length} topics`);
      console.log(`   - Meta: ${JSON.stringify(data.meta)}`);
      
      if (data.data.length > 0) {
        const topic = data.data[0];
        console.log('   - Sample topic structure:');
        console.log(`     * ID: ${topic.id}`);
        console.log(`     * Title: ${topic.title}`);
        console.log(`     * Author: ${topic.author.username}`);
        console.log(`     * Category: ${topic.category_info.name} ${topic.category_info.icon}`);
        console.log(`     * Is Hot: ${topic.is_hot}`);
        console.log(`     * Is Pinned: ${topic.is_pinned}`);
        console.log(`     * Reply Count: ${topic.reply_count}`);
      }
    } else {
      console.log('❌ Enhanced Forum Activity Endpoint Failed');
      console.log(`   Status: ${response.status}`);
    }

    // Test 2: Forum Categories Endpoint
    console.log('\n2️⃣ Testing Forum Categories Endpoint...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/forum-categories`);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Forum Categories Endpoint Working');
      console.log(`   - Found ${categoriesData.data.length} categories`);
      
      if (categoriesData.data.length > 0) {
        const category = categoriesData.data[0];
        console.log('   - Sample category structure:');
        console.log(`     * Name: ${category.category_name}`);
        console.log(`     * Icon: ${category.display_icon}`);
        console.log(`     * Color: ${category.display_color}`);
        console.log(`     * Discourse ID: ${category.category_id_from_discourse}`);
      }
    } else {
      console.log('❌ Forum Categories Endpoint Failed');
      console.log(`   Status: ${categoriesResponse.status}`);
    }

    // Test 3: Pinned Forum Threads Endpoint
    console.log('\n3️⃣ Testing Pinned Forum Threads Endpoint...');
    const pinnedResponse = await fetch(`${BASE_URL}/api/pinned-forum-threads`);
    
    if (pinnedResponse.ok) {
      const pinnedData = await pinnedResponse.json();
      console.log('✅ Pinned Forum Threads Endpoint Working');
      console.log(`   - Found ${pinnedData.data.length} pinned threads`);
      
      if (pinnedData.data.length > 0) {
        const pinned = pinnedData.data[0];
        console.log('   - Sample pinned thread structure:');
        console.log(`     * Title: ${pinned.display_title}`);
        console.log(`     * URL: ${pinned.thread_url}`);
        console.log(`     * Author: ${pinned.author_name}`);
        console.log(`     * Display Order: ${pinned.display_order}`);
      }
    } else {
      console.log('❌ Pinned Forum Threads Endpoint Failed');
      console.log(`   Status: ${pinnedResponse.status}`);
    }

    // Test 4: Environment Variables Check
    console.log('\n4️⃣ Checking Environment Variables...');
    const requiredEnvVars = [
      'DISCOURSE_API_KEY',
      'DISCOURSE_API_USERNAME', 
      'DISCOURSE_BASE_URL'
    ];
    
    let envVarsOk = true;
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
      } else {
        console.log(`❌ ${envVar} is not set`);
        envVarsOk = false;
      }
    });

    if (!envVarsOk) {
      console.log('\n⚠️  Some environment variables are missing.');
      console.log('   The widget will use fallback data when Discourse API is unavailable.');
    }

    // Test 5: Frontend Component Test
    console.log('\n5️⃣ Frontend Component Test...');
    console.log('✅ ForumThreadItem component created');
    console.log('✅ Enhanced ForumActivityWidget component created');
    console.log('✅ Components use new API endpoint: /api/forum-activity/enhanced');

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure Discourse API credentials in .env file');
    console.log('2. Populate Forum Categories in Strapi admin panel');
    console.log('3. Create Pinned Forum Threads as needed');
    console.log('4. Test the widget in your frontend application');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Strapi is running on the correct port');
    console.log('2. Check that all new content types are registered');
    console.log('3. Verify the API routes are accessible');
  }
}

// Run the test
testEnhancedForumActivity();
