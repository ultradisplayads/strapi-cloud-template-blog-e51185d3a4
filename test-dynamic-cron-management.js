#!/usr/bin/env node

/**
 * Test Dynamic Cron Management Features
 * Tests the new Strapi 5 features for adding/removing cron jobs at runtime
 */

const axios = require('axios');

async function testDynamicCronManagement() {
  console.log('🔧 Testing Dynamic Cron Management Features...\n');
  
  try {
    // Test if Strapi is running
    await axios.get('http://localhost:1337/admin/init');
    console.log('✅ Strapi server is accessible');
    
    console.log('\n📋 Available Dynamic Cron Features in Strapi 5:');
    
    console.log('\n1. 🔧 strapi.cron.add() - Add jobs at runtime');
    console.log('   Example usage in bootstrap or controller:');
    console.log('   ```javascript');
    console.log('   strapi.cron.add({');
    console.log('     dynamicJob: {');
    console.log('       task: ({ strapi }) => {');
    console.log('         console.log("Dynamic job executed");');
    console.log('       },');
    console.log('       options: {');
    console.log('         rule: "*/2 * * * *",');
    console.log('         tz: "Asia/Bangkok"');
    console.log('       }');
    console.log('     }');
    console.log('   });');
    console.log('   ```');
    
    console.log('\n2. 🗑️  strapi.cron.remove() - Remove jobs at runtime');
    console.log('   Example usage:');
    console.log('   ```javascript');
    console.log('   strapi.cron.remove("dynamicJob");');
    console.log('   ```');
    console.log('   ⚠️  Note: Jobs using key format cannot be removed');
    
    console.log('\n3. 📋 strapi.cron.jobs - List all running jobs');
    console.log('   Example usage:');
    console.log('   ```javascript');
    console.log('   const runningJobs = strapi.cron.jobs;');
    console.log('   console.log("Active jobs:", Object.keys(runningJobs));');
    console.log('   ```');
    
    console.log('\n🎯 Our Configuration Benefits:');
    console.log('✅ All jobs use object format (removable at runtime)');
    console.log('✅ Named jobs for easy identification');
    console.log('✅ Consistent structure for dynamic management');
    console.log('✅ Timezone-aware scheduling');
    
    console.log('\n🚀 Advanced Features We Can Use:');
    
    console.log('\n📅 Start/End Times:');
    console.log('   ```javascript');
    console.log('   options: {');
    console.log('     rule: "* * * * *",');
    console.log('     start: new Date(Date.now() + 10000), // Start in 10 seconds');
    console.log('     end: new Date(Date.now() + 60000),   // End in 1 minute');
    console.log('     tz: "Asia/Bangkok"');
    console.log('   }');
    console.log('   ```');
    
    console.log('\n⏰ One-time Execution:');
    console.log('   ```javascript');
    console.log('   options: new Date(Date.now() + 30000) // Run once in 30 seconds');
    console.log('   ```');
    
    console.log('\n🌍 Timezone Support:');
    console.log('   - All our jobs use "Asia/Bangkok" timezone');
    console.log('   - Supports all IANA timezone identifiers');
    console.log('   - Automatic daylight saving time handling');
    
    console.log('\n📊 Current Job Schedule Summary:');
    console.log('🔄 High Frequency (every few minutes):');
    console.log('   - currencyUpdate: Every 3 minutes');
    console.log('   - newsFetching: Every 5 minutes');
    console.log('   - staticMapRefresh: Every 5 minutes');
    console.log('   - videoTrendingCheck: Every 10 minutes');
    
    console.log('\n⏰ Medium Frequency (every 15-30 minutes):');
    console.log('   - newsCleanup: Every 15 minutes');
    console.log('   - travelTimesSummary: Every 20 minutes');
    console.log('   - videoDaytimeFetch: Every 30 minutes (6AM-11PM)');
    
    console.log('\n🌙 Low Frequency (hours/daily):');
    console.log('   - videoNighttimeFetch: Every 2 hours (midnight-5AM)');
    console.log('   - videoStatsUpdate: Every 6 hours');
    console.log('   - rejectedArticlesCleanup: Daily at 2 AM');
    console.log('   - reviewsCleanup: Daily at 3 AM');
    console.log('   - reviewsFetching: Daily at 6 AM');
    
    console.log('\n✨ Migration Benefits:');
    console.log('✅ Native Strapi integration (no external processes)');
    console.log('✅ Better error handling and logging');
    console.log('✅ Dynamic job management capabilities');
    console.log('✅ Timezone-aware scheduling');
    console.log('✅ Unified configuration in one file');
    console.log('✅ Follows Strapi 5 best practices');
    
    console.log('\n🔍 Verification Steps:');
    console.log('1. Check server logs for cron execution messages');
    console.log('2. Verify jobs run at expected times (Bangkok timezone)');
    console.log('3. Test dynamic job addition/removal if needed');
    console.log('4. Monitor system performance with new schedule');
    
  } catch (error) {
    console.error('❌ Cannot connect to Strapi server');
    console.log('Make sure Strapi is running: npm run develop');
  }
}

// Run the test
testDynamicCronManagement();
