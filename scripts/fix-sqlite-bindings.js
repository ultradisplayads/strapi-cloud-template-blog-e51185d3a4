#!/usr/bin/env node

/**
 * Fix SQLite bindings for better-sqlite3
 * Run this if you get "Could not locate the bindings file" error
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Fixing SQLite bindings...');

try {
  // Navigate to project root
  const projectRoot = path.join(__dirname, '..');
  process.chdir(projectRoot);
  
  console.log('📦 Rebuilding better-sqlite3...');
  execSync('npm rebuild better-sqlite3', { stdio: 'inherit' });
  
  console.log('✅ SQLite bindings fixed successfully!');
  console.log('💡 You can now run the SQL cleanup script without issues.');
  
} catch (error) {
  console.error('❌ Failed to fix SQLite bindings:', error.message);
  console.log('\n🔧 Manual fix options:');
  console.log('1. Run: npm rebuild better-sqlite3');
  console.log('2. Or: npm install better-sqlite3 --force');
  console.log('3. Or: rm -rf node_modules && npm install');
  process.exit(1);
}
