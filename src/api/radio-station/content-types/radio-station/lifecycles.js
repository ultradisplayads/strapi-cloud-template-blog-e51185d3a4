const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new radio-station in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('radio-station', result);
      strapi.log.info(`Indexed new radio-station ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing radio-station in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated radio-station in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('radio-station', result);
      strapi.log.info(`Updated radio-station ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating radio-station in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove radio-station from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('radio-station', result.documentId || result.id);
      strapi.log.info(`Removed radio-station ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing radio-station from Algolia:', error);
    }
  },
};