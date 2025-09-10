const GoogleCSEService = require('../../../../scripts/google-cse-service');

module.exports = {
  // Global web search
  async search(ctx) {
    try {
      const { query, page = 1, num = 10, safe = 'medium', country = 'us', language = 'lang_en' } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const googleCSE = new GoogleCSEService();
      const start = ((parseInt(page) - 1) * parseInt(num)) + 1;
      
      const results = await googleCSE.search(query, {
        num: parseInt(num),
        start: start,
        safe,
        country,
        language
      });

      ctx.body = {
        success: true,
        data: results,
        meta: {
          query: query,
          page: parseInt(page),
          resultsPerPage: parseInt(num),
          totalResults: results.totalResults,
          searchTime: results.searchTime
        }
      };
    } catch (error) {
      strapi.log.error('Web search error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: {
          query: ctx.query.query || '',
          results: [],
          totalResults: 0,
          searchTime: 0
        }
      };
    }
  },

  // Image search
  async searchImages(ctx) {
    try {
      const { query, page = 1, num = 8, imgSize = 'medium', imgType = 'photo', safe = 'medium' } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const googleCSE = new GoogleCSEService();
      const start = ((parseInt(page) - 1) * parseInt(num)) + 1;
      
      const results = await googleCSE.searchImages(query, {
        num: parseInt(num),
        start: start,
        imgSize,
        imgType,
        safe
      });

      ctx.body = {
        success: true,
        data: results,
        meta: {
          query: query,
          page: parseInt(page),
          resultsPerPage: parseInt(num),
          totalResults: results.totalResults,
          searchTime: results.searchTime,
          searchType: 'image'
        }
      };
    } catch (error) {
      strapi.log.error('Image search error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: {
          query: ctx.query.query || '',
          results: [],
          totalResults: 0,
          searchTime: 0
        }
      };
    }
  },

  // Site-specific search
  async searchSite(ctx) {
    try {
      const { query, site, page = 1, num = 10, safe = 'medium' } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }
      
      if (!site) {
        return ctx.badRequest('Site parameter is required');
      }

      const googleCSE = new GoogleCSEService();
      const start = ((parseInt(page) - 1) * parseInt(num)) + 1;
      
      const results = await googleCSE.searchSite(query, site, {
        num: parseInt(num),
        start: start,
        safe
      });

      ctx.body = {
        success: true,
        data: results,
        meta: {
          query: query,
          site: site,
          page: parseInt(page),
          resultsPerPage: parseInt(num),
          totalResults: results.totalResults,
          searchTime: results.searchTime
        }
      };
    } catch (error) {
      strapi.log.error('Site search error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: {
          query: ctx.query.query || '',
          results: [],
          totalResults: 0,
          searchTime: 0
        }
      };
    }
  },

  // Get search suggestions
  async suggestions(ctx) {
    try {
      const { query } = ctx.query;
      
      if (!query || query.length < 2) {
        return ctx.body = {
          success: true,
          data: [],
          meta: { query: query || '' }
        };
      }

      const googleCSE = new GoogleCSEService();
      const suggestions = await googleCSE.getSuggestions(query);

      ctx.body = {
        success: true,
        data: suggestions,
        meta: {
          query: query,
          count: suggestions.length
        }
      };
    } catch (error) {
      strapi.log.error('Search suggestions error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: [],
        meta: { query: ctx.query.query || '' }
      };
    }
  },

  // Check API status
  async status(ctx) {
    try {
      const googleCSE = new GoogleCSEService();
      const status = await googleCSE.getStatus();

      ctx.body = {
        success: true,
        data: status,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      strapi.log.error('CSE status check error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: {
          status: 'error',
          apiKey: 'unknown',
          engineId: 'unknown'
        }
      };
    }
  }
};
