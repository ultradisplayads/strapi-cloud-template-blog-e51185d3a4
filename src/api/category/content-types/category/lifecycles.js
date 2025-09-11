const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new category in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('category', result);
      strapi.log.info(`Indexed new category ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing category in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated category in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('category', result);
      strapi.log.info(`Updated category ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating category in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove category from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('category', result.documentId || result.id);
      strapi.log.info(`Removed category ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing category from Algolia:', error);
    }
  },
};