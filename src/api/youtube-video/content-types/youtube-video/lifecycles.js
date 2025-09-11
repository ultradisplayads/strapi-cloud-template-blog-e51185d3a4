const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new youtube-video in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('youtube-video', result);
      strapi.log.info(`Indexed new youtube-video ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing youtube-video in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated youtube-video in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('youtube-video', result);
      strapi.log.info(`Updated youtube-video ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating youtube-video in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove youtube-video from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('youtube-video', result.documentId || result.id);
      strapi.log.info(`Removed youtube-video ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing youtube-video from Algolia:', error);
    }
  },
};