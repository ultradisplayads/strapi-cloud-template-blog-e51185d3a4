const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new news-article in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('news-article', result);
      strapi.log.info(`Indexed new news-article ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing news-article in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated news-article in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('news-article', result);
      strapi.log.info(`Updated news-article ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating news-article in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove news-article from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('news-article', result.documentId || result.id);
      strapi.log.info(`Removed news-article ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing news-article from Algolia:', error);
    }
  },
};