const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new advertisement in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('advertisement', result);
      strapi.log.info(`Indexed new advertisement ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing advertisement in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated advertisement in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('advertisement', result);
      strapi.log.info(`Updated advertisement ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating advertisement in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove advertisement from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('advertisement', result.documentId || result.id);
      strapi.log.info(`Removed advertisement ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing advertisement from Algolia:', error);
    }
  },
};