const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new business-spotlight in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('business-spotlight', result);
      strapi.log.info(`Indexed new business-spotlight ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing business-spotlight in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated business-spotlight in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('business-spotlight', result);
      strapi.log.info(`Updated business-spotlight ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating business-spotlight in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove business-spotlight from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('business-spotlight', result.documentId || result.id);
      strapi.log.info(`Removed business-spotlight ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing business-spotlight from Algolia:', error);
    }
  },
};