const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new global in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('global', result);
      strapi.log.info(`Indexed new global ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing global in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated global in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('global', result);
      strapi.log.info(`Updated global ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating global in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove global from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('global', result.documentId || result.id);
      strapi.log.info(`Removed global ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing global from Algolia:', error);
    }
  },
};