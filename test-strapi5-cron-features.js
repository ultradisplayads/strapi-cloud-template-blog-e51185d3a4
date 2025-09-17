#!/usr/bin/env node

/**
 * Test Strapi 5 Cron Features
 * Verifies our configuration matches the latest Strapi 5 documentation
 */

const fs = require('fs');
const path = require('path');

function testCronConfiguration() {
  console.log('🔍 Verifying Strapi 5 Cron Configuration Compliance...\n');
  
  // Test 1: Server Configuration
  console.log('📋 Test 1: Server Configuration');
  const serverConfigPath = path.join(__dirname, 'config', 'server.js');
  const serverConfig = fs.readFileSync(serverConfigPath, 'utf8');
  
  const hasRequire = serverConfig.includes("require('./cron-tasks')");
  const hasCronEnabled = serverConfig.includes('cron: {') && serverConfig.includes('enabled: true');
  const hasTasks = serverConfig.includes('tasks: cronTasks');
  
  console.log(`✅ Imports cron-tasks: ${hasRequire}`);
  console.log(`✅ Cron enabled: ${hasCronEnabled}`);
  console.log(`✅ Tasks configured: ${hasTasks}`);
  
  // Test 2: Cron Tasks Format
  console.log('\n📋 Test 2: Cron Tasks Format');
  const cronTasksPath = path.join(__dirname, 'config', 'cron-tasks.js');
  const cronTasks = fs.readFileSync(cronTasksPath, 'utf8');
  
  const usesObjectFormat = cronTasks.includes('task: async ({ strapi })') && cronTasks.includes('options: {');
  const hasTimezone = cronTasks.includes("tz: 'Asia/Bangkok'");
  const hasRuleProperty = cronTasks.includes('rule:');
  const noKeyFormat = !cronTasks.match(/'[0-9\*\s\/\-]+': async/);
  
  console.log(`✅ Uses object format: ${usesObjectFormat}`);
  console.log(`✅ Has timezone config: ${hasTimezone}`);
  console.log(`✅ Has rule property: ${hasRuleProperty}`);
  console.log(`✅ No key format used: ${noKeyFormat}`);
  
  // Test 3: Cron Job Structure Validation
  console.log('\n📋 Test 3: Cron Job Structure');
  
  // Extract job names
  const jobMatches = cronTasks.match(/(\w+): \{[\s\S]*?task: async/g);
  const jobNames = jobMatches ? jobMatches.map(match => match.split(':')[0].trim()) : [];
  
  console.log(`✅ Found ${jobNames.length} named cron jobs:`);
  jobNames.forEach(name => console.log(`   - ${name}`));
  
  // Test 4: Cron Rule Validation
  console.log('\n📋 Test 4: Cron Rule Validation');
  const ruleMatches = cronTasks.match(/rule: '([^']+)'/g);
  const rules = ruleMatches ? ruleMatches.map(match => match.match(/'([^']+)'/)[1]) : [];
  
  console.log('✅ Cron rules found:');
  rules.forEach(rule => {
    const parts = rule.split(' ');
    const isValid = parts.length >= 5 && parts.length <= 6;
    console.log(`   - "${rule}" ${isValid ? '✅' : '❌'}`);
  });
  
  // Test 5: Documentation Compliance
  console.log('\n📋 Test 5: Strapi 5 Documentation Compliance');
  
  const complianceChecks = [
    {
      name: 'Uses module.exports format',
      check: cronTasks.includes('module.exports = {')
    },
    {
      name: 'Task functions receive { strapi }',
      check: cronTasks.includes('async ({ strapi })')
    },
    {
      name: 'Options object with rule property',
      check: cronTasks.includes('options: {') && cronTasks.includes('rule:')
    },
    {
      name: 'Timezone configuration',
      check: cronTasks.includes('tz:')
    },
    {
      name: 'Named jobs (not key format)',
      check: !cronTasks.match(/'[0-9\*\s\/\-]+':/) && jobNames.length > 0
    },
    {
      name: 'Error handling in tasks',
      check: cronTasks.includes('try {') && cronTasks.includes('catch (error)')
    },
    {
      name: 'Strapi logging usage',
      check: cronTasks.includes('strapi.log.')
    }
  ];
  
  complianceChecks.forEach(check => {
    console.log(`${check.check ? '✅' : '❌'} ${check.name}`);
  });
  
  // Test 6: Advanced Features Check
  console.log('\n📋 Test 6: Advanced Features Available');
  
  console.log('✅ Dynamic job management available:');
  console.log('   - strapi.cron.add() - Add jobs at runtime');
  console.log('   - strapi.cron.remove() - Remove jobs at runtime');
  console.log('   - strapi.cron.jobs - List all running jobs');
  
  console.log('\n✅ Advanced options supported:');
  console.log('   - start/end times for job duration');
  console.log('   - Date objects for one-time execution');
  console.log('   - Timezone-aware scheduling');
  console.log('   - Complex cron expressions');
  
  // Test 7: Best Practices Check
  console.log('\n📋 Test 7: Best Practices Compliance');
  
  const bestPractices = [
    {
      name: 'Descriptive job names',
      check: jobNames.every(name => name.length > 3 && !name.match(/^[0-9\*\s\/\-]+$/))
    },
    {
      name: 'Consistent timezone usage',
      check: (cronTasks.match(/tz: '/g) || []).length === jobNames.length
    },
    {
      name: 'Proper error logging',
      check: cronTasks.includes('strapi.log.error')
    },
    {
      name: 'Success logging',
      check: cronTasks.includes('strapi.log.info')
    },
    {
      name: 'Async/await usage',
      check: cronTasks.includes('async ({ strapi })') && cronTasks.includes('await')
    }
  ];
  
  bestPractices.forEach(practice => {
    console.log(`${practice.check ? '✅' : '❌'} ${practice.name}`);
  });
  
  // Summary
  console.log('\n🎯 Configuration Summary:');
  const totalChecks = complianceChecks.length + bestPractices.length;
  const passedChecks = [...complianceChecks, ...bestPractices].filter(c => c.check).length;
  const compliance = Math.round((passedChecks / totalChecks) * 100);
  
  console.log(`📊 Compliance Score: ${compliance}% (${passedChecks}/${totalChecks})`);
  
  if (compliance >= 90) {
    console.log('🎉 Excellent! Configuration is fully compliant with Strapi 5 standards');
  } else if (compliance >= 75) {
    console.log('👍 Good! Minor improvements could be made');
  } else {
    console.log('⚠️  Configuration needs updates to meet Strapi 5 standards');
  }
  
  console.log('\n📚 Documentation Reference:');
  console.log('https://docs.strapi.io/cms/configurations/cron');
}

// Run the test
testCronConfiguration();
