'use strict';

const axios = require('axios');

class YouTubeAPIService {
  constructor() {
    // Hardcoded YouTube API key for production deployment
    this.apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyCN2PoClgXJ0S2E6ixwcKUQiUYjekzl5G8';
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay
  }

  /**
   * Search for videos using YouTube Data API v3
   * @param {string} keyword - Search keyword
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of video objects
   */
  async searchVideos(keyword, options = {}) {
    const {
      maxResults = 10,
      order = 'relevance',
      publishedAfter = null,
      regionCode = 'TH',
      relevanceLanguage = 'en',
      safeSearch = 'strict',
      type = 'video',
      videoDuration = 'any',
      videoDefinition = 'any'
    } = options;

    const params = {
      part: 'snippet',
      q: keyword,
      type,
      maxResults,
      order,
      regionCode,
      relevanceLanguage,
      safeSearch,
      videoDuration,
      videoDefinition,
      key: this.apiKey
    };

    if (publishedAfter) {
      params.publishedAfter = publishedAfter;
    }

    return this.makeRequestWithRetry('/search', params);
  }

  /**
   * Get video details including statistics
   * @param {Array} videoIds - Array of video IDs
   * @returns {Promise<Array>} Array of detailed video objects
   */
  async getVideoDetails(videoIds) {
    if (!videoIds || videoIds.length === 0) {
      return [];
    }

    const params = {
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: this.apiKey
    };

    return this.makeRequestWithRetry('/videos', params);
  }

  /**
   * Make API request with retry logic for quota errors
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} API response
   */
  async makeRequestWithRetry(endpoint, params, retryCount = 0) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params,
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      // Handle quota exceeded errors
      if (error.response?.status === 403 && 
          error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
        
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`YouTube API quota exceeded. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${this.maxRetries})`);
          
          await this.sleep(delay);
          return this.makeRequestWithRetry(endpoint, params, retryCount + 1);
        } else {
          throw new Error('YouTube API quota exceeded. Maximum retries reached.');
        }
      }

      // Handle other API errors
      if (error.response?.data?.error) {
        throw new Error(`YouTube API Error: ${error.response.data.error.message}`);
      }

      throw error;
    }
  }

  /**
   * Normalize YouTube API response to clean video objects
   * @param {Object} apiResponse - Raw YouTube API response
   * @param {Array} videoDetails - Optional detailed video info
   * @returns {Array} Normalized video objects
   */
  normalizeVideoResponse(apiResponse, videoDetails = []) {
    if (!apiResponse.items) {
      return [];
    }

    return apiResponse.items.map(item => {
      const videoId = item.id?.videoId || item.id;
      const snippet = item.snippet;
      
      // Find matching video details if available
      const details = videoDetails.find(detail => detail.id === videoId);
      
      return {
        video_id: videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnail_url: snippet.thumbnails?.high?.url || 
                      snippet.thumbnails?.medium?.url || 
                      snippet.thumbnails?.default?.url,
        channel_name: snippet.channelTitle,
        channel_id: snippet.channelId,
        video_published_at: snippet.publishedAt,
        duration: details?.contentDetails?.duration || null,
        view_count: parseInt(details?.statistics?.viewCount || 0),
        like_count: parseInt(details?.statistics?.likeCount || 0),
        tags: snippet.tags || [],
        category: this.categorizeVideo(snippet.title, snippet.description, snippet.tags),
        status: 'pending' // Default status for new videos
      };
    });
  }

  /**
   * Categorize video based on title, description, and tags
   * @param {string} title - Video title
   * @param {string} description - Video description
   * @param {Array} tags - Video tags
   * @returns {string} Category
   */
  categorizeVideo(title, description, tags = []) {
    const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
    
    const categories = {
      'Travel': ['travel', 'trip', 'vacation', 'tourism', 'destination', 'journey', 'explore'],
      'Food': ['food', 'restaurant', 'cooking', 'recipe', 'cuisine', 'dining', 'eat'],
      'Nightlife': ['nightlife', 'bar', 'club', 'party', 'night', 'entertainment'],
      'Culture': ['culture', 'tradition', 'festival', 'temple', 'history', 'art'],
      'Adventure': ['adventure', 'extreme', 'sport', 'diving', 'hiking', 'outdoor'],
      'Hotels': ['hotel', 'resort', 'accommodation', 'stay', 'booking'],
      'Entertainment': ['show', 'performance', 'music', 'concert', 'theater'],
      'Sports': ['sport', 'football', 'boxing', 'fitness', 'gym', 'exercise']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }

    return 'Travel'; // Default category
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if API key is configured
   * @returns {boolean} True if API key is available
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = YouTubeAPIService;
