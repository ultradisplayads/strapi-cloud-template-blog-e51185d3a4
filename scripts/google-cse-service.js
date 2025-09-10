require('dotenv').config();
const axios = require('axios');

class GoogleCSEService {
  constructor() {
    this.apiKey = process.env.GOOGLE_CSE_API_KEY;
    this.engineId = process.env.GOOGLE_CSE_ENGINE_ID;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
    
    if (!this.apiKey || !this.engineId) {
      console.warn('⚠️  Google CSE credentials not configured');
    }
  }

  /**
   * Perform web search using Google CSE
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async search(query, options = {}) {
    try {
      if (!this.apiKey || !this.engineId) {
        throw new Error('Google CSE credentials not configured');
      }

      const params = {
        key: this.apiKey,
        cx: this.engineId,
        q: query,
        num: options.num || 10, // Number of results (1-10)
        start: options.start || 1, // Starting index
        safe: options.safe || 'medium', // Safe search: off, medium, high
        lr: options.language || 'lang_en', // Language restriction
        gl: options.country || 'us', // Country restriction
        ...options.filters
      };

      // Add image search if specified
      if (options.searchType === 'image') {
        params.searchType = 'image';
        params.imgSize = options.imgSize || 'medium';
        params.imgType = options.imgType || 'photo';
      }

      // Add date restrictions if specified
      if (options.dateRestrict) {
        params.dateRestrict = options.dateRestrict; // d[number], w[number], m[number], y[number]
      }

      // Add site restriction if specified
      if (options.siteSearch) {
        params.siteSearch = options.siteSearch;
        params.siteSearchFilter = options.siteSearchFilter || 'i'; // i=include, e=exclude
      }

      console.log(`🔍 Google CSE search: "${query}"`);
      
      const response = await axios.get(this.baseUrl, { params });
      
      return this.formatResults(response.data, query);
      
    } catch (error) {
      console.error('❌ Google CSE search error:', error.message);
      
      if (error.response?.status === 429) {
        throw new Error('Search quota exceeded. Please try again later.');
      } else if (error.response?.status === 403) {
        throw new Error('Invalid API key or search engine ID.');
      } else {
        throw new Error('Search service temporarily unavailable.');
      }
    }
  }

  /**
   * Format Google CSE results for consistent API response
   * @param {Object} data - Raw Google CSE response
   * @param {string} query - Original search query
   * @returns {Object} Formatted results
   */
  formatResults(data, query) {
    const items = data.items || [];
    
    return {
      query: query,
      totalResults: parseInt(data.searchInformation?.totalResults || 0),
      searchTime: parseFloat(data.searchInformation?.searchTime || 0),
      results: items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        htmlTitle: item.htmlTitle,
        htmlSnippet: item.htmlSnippet,
        cacheId: item.cacheId,
        image: item.pagemap?.cse_image?.[0] || null,
        thumbnail: item.pagemap?.cse_thumbnail?.[0] || null,
        metatags: item.pagemap?.metatags?.[0] || {},
        breadcrumbs: item.pagemap?.breadcrumb || []
      })),
      pagination: {
        currentPage: Math.ceil((data.queries?.request?.[0]?.startIndex || 1) / 10),
        totalPages: Math.ceil((data.searchInformation?.totalResults || 0) / 10),
        hasNextPage: !!data.queries?.nextPage,
        hasPreviousPage: !!data.queries?.previousPage,
        nextPageStart: data.queries?.nextPage?.[0]?.startIndex,
        previousPageStart: data.queries?.previousPage?.[0]?.startIndex
      },
      suggestions: data.spelling?.correctedQuery ? [data.spelling.correctedQuery] : [],
      meta: {
        searchEngine: 'Google CSE',
        timestamp: new Date().toISOString(),
        quota: {
          dailyLimit: 100, // Free tier limit
          used: 'Check Google Cloud Console for usage'
        }
      }
    };
  }

  /**
   * Search for images using Google CSE
   * @param {string} query - Search query
   * @param {Object} options - Image search options
   * @returns {Promise<Object>} Image search results
   */
  async searchImages(query, options = {}) {
    return this.search(query, {
      ...options,
      searchType: 'image',
      num: options.num || 8
    });
  }

  /**
   * Search within specific site
   * @param {string} query - Search query
   * @param {string} site - Site to search within
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Site-specific search results
   */
  async searchSite(query, site, options = {}) {
    return this.search(query, {
      ...options,
      siteSearch: site,
      siteSearchFilter: 'i'
    });
  }

  /**
   * Get search suggestions (basic implementation)
   * @param {string} query - Partial query
   * @returns {Promise<Array>} Search suggestions
   */
  async getSuggestions(query) {
    try {
      // Google CSE doesn't provide autocomplete, but we can simulate it
      // by searching and extracting common terms from results
      const results = await this.search(query, { num: 5 });
      
      const suggestions = [];
      results.results.forEach(result => {
        const words = result.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.includes(query.toLowerCase()) && word.length > query.length) {
            if (!suggestions.includes(word) && suggestions.length < 5) {
              suggestions.push(word);
            }
          }
        });
      });
      
      return suggestions;
    } catch (error) {
      console.error('❌ Suggestions error:', error.message);
      return [];
    }
  }

  /**
   * Check API quota and status
   * @returns {Promise<Object>} API status information
   */
  async getStatus() {
    try {
      // Perform a minimal search to check API status
      const testResult = await this.search('test', { num: 1 });
      
      return {
        status: 'operational',
        apiKey: this.apiKey ? 'configured' : 'missing',
        engineId: this.engineId ? 'configured' : 'missing',
        lastTest: new Date().toISOString(),
        testQuery: testResult.totalResults > 0 ? 'success' : 'no_results'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        apiKey: this.apiKey ? 'configured' : 'missing',
        engineId: this.engineId ? 'configured' : 'missing',
        lastTest: new Date().toISOString()
      };
    }
  }
}

module.exports = GoogleCSEService;
