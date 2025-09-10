const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new trending-topic in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('trending-topic', result);
      strapi.log.info(`Indexed new trending-topic ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing trending-topic in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated trending-topic in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('trending-topic', result);
      strapi.log.info(`Updated trending-topic ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating trending-topic in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove trending-topic from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('trending-topic', result.documentId || result.id);
      strapi.log.info(`Removed trending-topic ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing trending-topic from Algolia:', error);
    }
  },
};