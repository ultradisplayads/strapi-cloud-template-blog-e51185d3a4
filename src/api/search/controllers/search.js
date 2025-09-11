const OptimizedAlgoliaService = require('../../../../scripts/optimized-algolia-service');

module.exports = {
  // Unified search across all content types
  async search(ctx) {
    try {
      const { query, contentType, filters, page = 0, hitsPerPage = 20 } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const algoliaService = new OptimizedAlgoliaService();
      const results = await algoliaService.search(query, {
        contentType: contentType || 'unified',
        filters,
        page: parseInt(page),
        hitsPerPage: parseInt(hitsPerPage)
      });

      ctx.body = {
        data: results.hits,
        meta: {
          pagination: {
            page: results.page,
            pageSize: results.hitsPerPage,
            pageCount: results.nbPages,
            total: results.nbHits
          },
          processingTimeMS: results.processingTimeMS,
          facets: results.facets
        }
      };
    } catch (error) {
      strapi.log.error('Search error:', error);
      ctx.internalServerError('Search failed');
    }
  },

  // Search specifically in breaking news
  async searchBreakingNews(ctx) {
    try {
      const { query, filters, page = 0, hitsPerPage = 20 } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const algoliaService = new OptimizedAlgoliaService();
      const results = await algoliaService.search(query, {
        contentType: 'breaking-news',
        filters,
        page: parseInt(page),
        hitsPerPage: parseInt(hitsPerPage)
      });

      ctx.body = {
        data: results.hits,
        meta: {
          pagination: {
            page: results.page,
            pageSize: results.hitsPerPage,
            pageCount: results.nbPages,
            total: results.nbHits
          },
          processingTimeMS: results.processingTimeMS
        }
      };
    } catch (error) {
      strapi.log.error('Breaking news search error:', error);
      ctx.internalServerError('Breaking news search failed');
    }
  },

  // Search specifically in sponsored posts
  async searchSponsoredPosts(ctx) {
    try {
      const { query, filters, page = 0, hitsPerPage = 20 } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const algoliaService = new OptimizedAlgoliaService();
      const results = await algoliaService.search(query, {
        contentType: 'sponsored-post',
        filters,
        page: parseInt(page),
        hitsPerPage: parseInt(hitsPerPage)
      });

      ctx.body = {
        data: results.hits,
        meta: {
          pagination: {
            page: results.page,
            pageSize: results.hitsPerPage,
            pageCount: results.nbPages,
            total: results.nbHits
          },
          processingTimeMS: results.processingTimeMS
        }
      };
    } catch (error) {
      strapi.log.error('Sponsored posts search error:', error);
      ctx.internalServerError('Sponsored posts search failed');
    }
  },

  // Search specifically in news sources
  async searchNewsSources(ctx) {
    try {
      const { query, filters, page = 0, hitsPerPage = 20 } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const algoliaService = new OptimizedAlgoliaService();
      const results = await algoliaService.search(query, {
        contentType: 'news-source',
        filters,
        page: parseInt(page),
        hitsPerPage: parseInt(hitsPerPage)
      });

      ctx.body = {
        data: results.hits,
        meta: {
          pagination: {
            page: results.page,
            pageSize: results.hitsPerPage,
            pageCount: results.nbPages,
            total: results.nbHits
          },
          processingTimeMS: results.processingTimeMS
        }
      };
    } catch (error) {
      strapi.log.error('News sources search error:', error);
      ctx.internalServerError('News sources search failed');
    }
  },

  // Reindex all content in Algolia
  async reindexAll(ctx) {
    try {
      const algoliaService = new OptimizedAlgoliaService();
      const results = await algoliaService.indexAllContent();

      ctx.body = {
        message: 'Reindexing completed successfully',
        data: results
      };
    } catch (error) {
      strapi.log.error('Reindexing error:', error);
      ctx.internalServerError('Reindexing failed');
    }
  }
};
