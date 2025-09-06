#!/usr/bin/env node

/**
 * Manual cleanup script to enforce article limit
 * This will clean up articles based on the current settings
 */

const axios = require('axios');

async function manualCleanup() {
  try {
    console.log('🧹 Starting manual cleanup...');
    
    // Get the dynamic article limit from settings
    let maxArticleLimit = 10; // Default to 10 as requested
    try {
      const settingsResponse = await axios.get('http://localhost:1337/api/news-settings');
      if (settingsResponse.data.data && settingsResponse.data.data.maxArticleLimit) {
        maxArticleLimit = settingsResponse.data.data.maxArticleLimit;
        console.log(`⚙️  Using configured article limit: ${maxArticleLimit}`);
      } else {
        console.log(`⚙️  Using default article limit: ${maxArticleLimit}`);
      }
    } catch (settingsError) {
      console.log(`⚠️  Could not fetch settings, using default limit: ${maxArticleLimit}`);
    }
    
    // Get all breaking news articles ordered by creation date (newest first)
    const allArticles = await axios.get('http://localhost:1337/api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=200');
    const articles = allArticles.data.data;
    
    console.log(`📊 Found ${articles.length} total articles`);
    console.log(`🎯 Target limit: ${maxArticleLimit} articles`);
    
    // Count breaking news articles
    const breakingNews = articles.filter(article => article.IsBreaking);
    console.log(`⚡ Breaking news articles: ${breakingNews.length}`);
    
    // If we have more than the configured limit, delete the oldest ones
    if (articles.length > maxArticleLimit) {
      const articlesToDelete = articles.slice(maxArticleLimit); // Get articles beyond the limit
      console.log(`🗑️  Deleting ${articlesToDelete.length} oldest articles to maintain limit of ${maxArticleLimit}`);
      
      let deletedCount = 0;
      let deletedBreaking = 0;
      
      for (const article of articlesToDelete) {
        try {
          await axios.delete(`http://localhost:1337/api/breaking-news-plural/${article.id}`);
          console.log(`✅ Deleted: ${article.Title.substring(0, 50)}... ${article.IsBreaking ? '(BREAKING)' : ''}`);
          deletedCount++;
          if (article.IsBreaking) deletedBreaking++;
        } catch (deleteError) {
          console.log(`❌ Failed to delete article ${article.id}: ${deleteError.message}`);
        }
      }
      
      console.log(`\n🎉 Cleanup completed!`);
      console.log(`📈 Deleted ${deletedCount} articles (${deletedBreaking} breaking news)`);
      console.log(`📊 Remaining articles: ${articles.length - deletedCount}`);
      
    } else {
      console.log(`✅ Article count (${articles.length}) is within limit of ${maxArticleLimit}. No cleanup needed.`);
    }
    
  } catch (error) {
    console.log(`❌ Cleanup failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the cleanup
manualCleanup();
