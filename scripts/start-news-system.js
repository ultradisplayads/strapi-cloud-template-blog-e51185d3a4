#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Strapi News System...\n');

// Start the news scheduler
const schedulerPath = path.join(__dirname, 'alternative-scheduler.js');
const scheduler = spawn('node', [schedulerPath], {
  stdio: 'inherit',
  cwd: path.dirname(__dirname)
});

scheduler.on('error', (error) => {
  console.error('❌ Failed to start news scheduler:', error.message);
  process.exit(1);
});

scheduler.on('close', (code) => {
  console.log(`\n🛑 News scheduler stopped with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down news system...');
  scheduler.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating news system...');
  scheduler.kill('SIGTERM');
});

console.log('✅ News system started successfully');
console.log('📡 News will be fetched every minute automatically');
console.log('🔍 Monitor the logs above for fetch status');
console.log('⏹️  Press Ctrl+C to stop\n');