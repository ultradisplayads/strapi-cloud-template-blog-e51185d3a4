const fs = require('fs');
const path = require('path');

// All content types that need lifecycle hooks
const contentTypes = [
  'about', 'advertisement', 'author', 'booking', 'business', 'business-spotlight',
  'category', 'deal', 'event', 'event-calendar', 'firebase-auth', 'forum-activity',
  'global', 'global-sponsorship', 'google-review', 'live-event', 'news-article',
  'photo-gallery', 'quick-link', 'radio-station', 'review', 'social-media-post',
  'traffic-incident', 'traffic-route', 'trending-topic', 'weather',
  'weather-activity-suggestion', 'widget-control', 'youtube-video'
];

// Generate lifecycle hook content
function generateLifecycleHook(contentType) {
  return `const ComprehensiveAlgoliaService = require('../../../../../scripts/comprehensive-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new ${contentType} in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('${contentType}', result);
      strapi.log.info(\`Indexed new ${contentType} \${result.id} in Algolia search index\`);
    } catch (error) {
      strapi.log.error('Error indexing ${contentType} in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated ${contentType} in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('${contentType}', result);
      strapi.log.info(\`Updated ${contentType} \${result.id} in Algolia search index\`);
    } catch (error) {
      strapi.log.error('Error updating ${contentType} in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove ${contentType} from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('${contentType}', result.documentId || result.id);
      strapi.log.info(\`Removed ${contentType} \${result.id} from Algolia search index\`);
    } catch (error) {
      strapi.log.error('Error removing ${contentType} from Algolia:', error);
    }
  },
};`;
}

// Create lifecycle hooks for all content types
async function createAllLifecycleHooks() {
  console.log('🔄 Creating lifecycle hooks for all content types...');
  
  let created = 0;
  let skipped = 0;
  
  for (const contentType of contentTypes) {
    const lifecyclePath = path.join(
      __dirname, 
      '..', 
      'src', 
      'api', 
      contentType, 
      'content-types', 
      contentType, 
      'lifecycles.js'
    );
    
    // Check if lifecycle file already exists
    if (fs.existsSync(lifecyclePath)) {
      console.log(`   ⏭️  Skipping ${contentType} (lifecycle already exists)`);
      skipped++;
      continue;
    }
    
    // Check if content type directory exists
    const contentTypeDir = path.dirname(lifecyclePath);
    if (!fs.existsSync(contentTypeDir)) {
      console.log(`   ⚠️  Skipping ${contentType} (directory doesn't exist)`);
      skipped++;
      continue;
    }
    
    try {
      // Create lifecycle hook file
      const lifecycleContent = generateLifecycleHook(contentType);
      fs.writeFileSync(lifecyclePath, lifecycleContent);
      console.log(`   ✅ Created lifecycle hook for ${contentType}`);
      created++;
    } catch (error) {
      console.log(`   ❌ Failed to create lifecycle for ${contentType}: ${error.message}`);
      skipped++;
    }
  }
  
  console.log(`\n🎉 Lifecycle hook generation complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${contentTypes.length}`);
}

// Run the script
if (require.main === module) {
  createAllLifecycleHooks().catch(console.error);
}

module.exports = { createAllLifecycleHooks, contentTypes };
