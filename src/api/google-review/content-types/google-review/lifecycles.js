const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new google-review in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('google-review', result);
      strapi.log.info(`Indexed new google-review ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing google-review in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated google-review in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('google-review', result);
      strapi.log.info(`Updated google-review ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating google-review in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove google-review from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('google-review', result.documentId || result.id);
      strapi.log.info(`Removed google-review ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing google-review from Algolia:', error);
    }
  },
};