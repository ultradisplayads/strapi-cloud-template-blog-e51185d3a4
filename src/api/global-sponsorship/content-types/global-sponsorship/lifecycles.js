const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new global-sponsorship in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('global-sponsorship', result);
      strapi.log.info(`Indexed new global-sponsorship ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing global-sponsorship in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated global-sponsorship in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('global-sponsorship', result);
      strapi.log.info(`Updated global-sponsorship ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating global-sponsorship in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove global-sponsorship from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('global-sponsorship', result.documentId || result.id);
      strapi.log.info(`Removed global-sponsorship ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing global-sponsorship from Algolia:', error);
    }
  },
};