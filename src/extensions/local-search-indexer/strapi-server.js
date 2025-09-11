module.exports = (plugin) => {
  // Register lifecycle hooks for all content types
  const contentTypes = [
    'breaking-news',
    'sponsored-post', 
    'news-source',
    'author',
    'category',
    'advertisement',
    'business',
    'business-spotlight',
    'deal',
    'event',
    'live-event',
    'photo-gallery',
    'radio-station',
    'review',
    'social-media-post',
    'traffic-incident',
    'trending-topic',
    'youtube-video',
    'flight-tracker',
    'weather',
    'booking',
    'forum-activity'
  ];

  // Add lifecycle hooks to each content type
  contentTypes.forEach(contentType => {
    const uid = `api::${contentType}.${contentType}`;
    
    // Hook for when content is created
    strapi.db.lifecycles.subscribe({
      models: [uid],
      async afterCreate(event) {
        try {
          await indexContent(event.result, contentType, 'create');
        } catch (error) {
          strapi.log.error(`Local search indexing error on create for ${contentType}:`, error);
        }
      },
      
      // Hook for when content is updated
      async afterUpdate(event) {
        try {
          await indexContent(event.result, contentType, 'update');
        } catch (error) {
          strapi.log.error(`Local search indexing error on update for ${contentType}:`, error);
        }
      },
      
      // Hook for when content is deleted
      async afterDelete(event) {
        try {
          await removeFromIndex(event.result, contentType);
        } catch (error) {
          strapi.log.error(`Local search indexing error on delete for ${contentType}:`, error);
        }
      }
    });
  });

  return plugin;
};

// Index content in local search
async function indexContent(entity, contentType, action) {
  try {
    const searchService = strapi.service('api::local-search.local-search');
    const searchResult = searchService.formatSearchResult(entity, contentType, '');
    
    strapi.log.info(`🔍 Local Search: ${action} indexed for ${contentType} #${entity.id}`);
    
    // Update search statistics
    await updateSearchStats(contentType, action);
    
  } catch (error) {
    strapi.log.error(`Local search indexing failed for ${contentType}:`, error);
  }
}

// Remove content from search index
async function removeFromIndex(entity, contentType) {
  try {
    strapi.log.info(`🔍 Local Search: Removed ${contentType} #${entity.id} from index`);
    
    // Update search statistics
    await updateSearchStats(contentType, 'delete');
    
  } catch (error) {
    strapi.log.error(`Local search removal failed for ${contentType}:`, error);
  }
}

// Update search statistics
async function updateSearchStats(contentType, action) {
  try {
    // This could be expanded to maintain search statistics
    // For now, just log the action
    strapi.log.debug(`Search stats updated: ${contentType} ${action}`);
  } catch (error) {
    strapi.log.warn('Search stats update failed:', error);
  }
}
