#!/usr/bin/env node

/**
 * SQL-based cleanup manager that bypasses Strapi API issues
 * Directly manages database to enforce article limits
 */

const Database = require('better-sqlite3');
const path = require('path');
const axios = require('axios');

class SQLCleanupManager {
  constructor() {
    this.dbPath = path.join(process.cwd(), '.tmp', 'data.db');
    this.isRunning = false;
  }

  async getSettings() {
    try {
      const response = await axios.get('http://localhost:1337/api/news-settings');
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].maxArticleLimit || 5;
      }
    } catch (error) {
      console.log('⚠️  Could not fetch settings, using default limit: 5');
    }
    return 5; // default
  }

  async enforceLimit() {
    if (this.isRunning) {
      console.log('⏳ SQL cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    let db;

    try {
      console.log('🗑️  Starting SQL-based cleanup...');
      
      // Get current limit from settings
      const maxLimit = await this.getSettings();
      console.log(`⚙️  Max article limit: ${maxLimit}`);

      // Connect to database
      db = new Database(this.dbPath, { readonly: false });

      // Count current articles
      const currentCount = db.prepare("SELECT COUNT(*) as count FROM breaking_news_plural").get().count;
      console.log(`📊 Current articles: ${currentCount}`);

      if (currentCount <= maxLimit) {
        console.log(`✅ Article count is within limit (${currentCount}/${maxLimit})`);
        return { success: true, deleted: 0, message: 'Within limit' };
      }

      // Calculate excess
      const excessCount = currentCount - maxLimit;
      console.log(`🗑️  Need to delete ${excessCount} excess articles`);

      // Get oldest articles to delete (keep newest)
      const articlesToDelete = db.prepare(`
        SELECT id, title, created_at 
        FROM breaking_news_plural 
        ORDER BY created_at ASC 
        LIMIT ?
      `).all(excessCount);

      console.log(`📋 Deleting ${articlesToDelete.length} oldest articles:`);

      // Delete articles one by one
      let deletedCount = 0;
      const deleteStmt = db.prepare("DELETE FROM breaking_news_plural WHERE id = ?");

      for (const article of articlesToDelete) {
        try {
          const result = deleteStmt.run(article.id);
          if (result.changes > 0) {
            deletedCount++;
            console.log(`✅ Deleted: "${article.title?.substring(0, 50)}..." (ID: ${article.id})`);
          } else {
            console.log(`❌ Failed to delete ID: ${article.id}`);
          }
        } catch (deleteError) {
          console.log(`❌ Error deleting ID ${article.id}: ${deleteError.message}`);
        }
      }

      // Verify final count
      const finalCount = db.prepare("SELECT COUNT(*) as count FROM breaking_news_plural").get().count;
      console.log(`📊 Final count: ${finalCount} (deleted ${deletedCount} articles)`);

      const success = finalCount <= maxLimit;
      console.log(success ? 
        `✅ SUCCESS: Article count now within limit (${finalCount}/${maxLimit})` :
        `❌ ISSUE: Still exceeds limit (${finalCount}/${maxLimit})`
      );

      return {
        success,
        deleted: deletedCount,
        finalCount,
        maxLimit,
        message: success ? 'Cleanup successful' : 'Cleanup incomplete'
      };

    } catch (error) {
      console.error('❌ SQL cleanup failed:', error.message);
      return { success: false, error: error.message };
    } finally {
      if (db) {
        db.close();
      }
      this.isRunning = false;
    }
  }

  async getActualCount() {
    let db;
    try {
      db = new Database(this.dbPath, { readonly: true });
      const count = db.prepare("SELECT COUNT(*) as count FROM breaking_news_plural").get().count;
      return count;
    } catch (error) {
      console.error('❌ Error getting count:', error.message);
      return -1;
    } finally {
      if (db) {
        db.close();
      }
    }
  }

  async cleanupDuplicates() {
    let db;
    try {
      console.log('🔄 Cleaning up duplicate articles...');
      db = new Database(this.dbPath, { readonly: false });

      // Find duplicates by URL
      const duplicates = db.prepare(`
        SELECT url, COUNT(*) as count, MIN(id) as keep_id
        FROM breaking_news_plural 
        WHERE url IS NOT NULL 
        GROUP BY url 
        HAVING COUNT(*) > 1
      `).all();

      if (duplicates.length === 0) {
        console.log('✅ No duplicates found');
        return { success: true, deleted: 0 };
      }

      console.log(`🔍 Found ${duplicates.length} duplicate URL groups`);

      let totalDeleted = 0;
      const deleteStmt = db.prepare("DELETE FROM breaking_news_plural WHERE url = ? AND id != ?");

      for (const dup of duplicates) {
        const result = deleteStmt.run(dup.url, dup.keep_id);
        totalDeleted += result.changes;
        console.log(`🗑️  Removed ${result.changes} duplicates for URL: ${dup.url?.substring(0, 50)}...`);
      }

      console.log(`✅ Removed ${totalDeleted} duplicate articles`);
      return { success: true, deleted: totalDeleted };

    } catch (error) {
      console.error('❌ Duplicate cleanup failed:', error.message);
      return { success: false, error: error.message };
    } finally {
      if (db) {
        db.close();
      }
    }
  }
}

// Export for use in other scripts
module.exports = SQLCleanupManager;

// Run directly if called as script
if (require.main === module) {
  const manager = new SQLCleanupManager();
  
  async function runCleanup() {
    console.log('🚀 Running SQL Cleanup Manager...\n');
    
    // Clean duplicates first
    await manager.cleanupDuplicates();
    
    // Then enforce limit
    const result = await manager.enforceLimit();
    
    console.log('\n📊 Final Status:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Deleted: ${result.deleted || 0} articles`);
    console.log(`   Message: ${result.message || 'N/A'}`);
    
    if (result.finalCount !== undefined) {
      console.log(`   Final Count: ${result.finalCount}/${result.maxLimit}`);
    }
  }
  
  runCleanup().catch(console.error);
}
