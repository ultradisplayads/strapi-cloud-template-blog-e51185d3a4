const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new business in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('business', result);
      strapi.log.info(`Indexed new business ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing business in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated business in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('business', result);
      strapi.log.info(`Updated business ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating business in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove business from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('business', result.documentId || result.id);
      strapi.log.info(`Removed business ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing business from Algolia:', error);
    }
  },
};