const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new news source in Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('news-source', result);
      strapi.log.info(`Indexed new news source ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing new news source in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated news source in Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('news-source', result);
      strapi.log.info(`Updated news source ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating news source in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove deleted news source from Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.deleteItem('news-source', result.documentId);
      strapi.log.info(`Removed news source ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing news source from Algolia:', error);
    }
  }
};
