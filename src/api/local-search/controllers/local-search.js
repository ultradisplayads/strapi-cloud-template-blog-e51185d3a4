module.exports = {
  // Universal search across all content types
  async search(ctx) {
    try {
      const { query, type, limit = 20, page = 1 } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const results = await strapi.service('api::local-search.local-search').searchAll(query, {
        contentType: type,
        limit: parseInt(limit),
        page: parseInt(page)
      });

      ctx.body = {
        success: true,
        data: results,
        meta: {
          query,
          contentType: type || 'all',
          page: parseInt(page),
          limit: parseInt(limit),
          totalResults: results.length
        }
      };
    } catch (error) {
      strapi.log.error('Local search error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Get search suggestions
  async suggestions(ctx) {
    try {
      const { query, limit = 5 } = ctx.query;
      
      if (!query || query.length < 2) {
        return ctx.body = {
          success: true,
          data: [],
          meta: { query: query || '' }
        };
      }

      const suggestions = await strapi.service('api::local-search.local-search').getSuggestions(query, parseInt(limit));

      ctx.body = {
        success: true,
        data: suggestions,
        meta: {
          query,
          count: suggestions.length
        }
      };
    } catch (error) {
      strapi.log.error('Search suggestions error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Get available content types for filtering
  async contentTypes(ctx) {
    try {
      const contentTypes = await strapi.service('api::local-search.local-search').getAvailableContentTypes();

      ctx.body = {
        success: true,
        data: contentTypes,
        meta: {
          count: contentTypes.length
        }
      };
    } catch (error) {
      strapi.log.error('Content types error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Reindex all content
  async reindex(ctx) {
    try {
      const result = await strapi.service('api::local-search.local-search').reindexAll();

      ctx.body = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      strapi.log.error('Reindex error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: { indexed: 0, errors: 1 }
      };
    }
  },

  // Get search statistics
  async stats(ctx) {
    try {
      const stats = await strapi.service('api::local-search.local-search').getSearchStats();

      ctx.body = {
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      strapi.log.error('Search stats error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }
};
