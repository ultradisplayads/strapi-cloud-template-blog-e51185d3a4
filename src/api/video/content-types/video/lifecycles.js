const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new video in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('video', result);
      strapi.log.info(`Indexed new video ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing video in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated video in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('video', result);
      strapi.log.info(`Updated video ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating video in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove video from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('video', result.documentId || result.id);
      strapi.log.info(`Removed video ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing video from Algolia:', error);
    }
  },
};
