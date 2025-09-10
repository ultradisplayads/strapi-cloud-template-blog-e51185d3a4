const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new forum-activity in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('forum-activity', result);
      strapi.log.info(`Indexed new forum-activity ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing forum-activity in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated forum-activity in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('forum-activity', result);
      strapi.log.info(`Updated forum-activity ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating forum-activity in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove forum-activity from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('forum-activity', result.documentId || result.id);
      strapi.log.info(`Removed forum-activity ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing forum-activity from Algolia:', error);
    }
  },
};