'use strict';

/**
 * videos service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::video.video', ({ strapi }) => ({
  /**
   * Fetch videos by keyword from existing youtube-video content type
   * @param {string} keyword - Search keyword
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Filtered video objects
   */
  async fetchVideosByKeyword(keyword, options = {}) {
    try {
      // Fetch from existing youtube-video content type
      const videos = await strapi.entityService.findMany('api::youtube-video.youtube-video', {
        filters: {
          $or: [
            { title: { $containsi: keyword } },
            { description: { $containsi: keyword } },
            { tags: { $containsi: keyword } }
          ]
        },
        limit: options.maxResults || 10,
        sort: { createdAt: 'desc' }
      });

      if (!videos || videos.length === 0) {
        return [];
      }

      // Apply content filtering
      const filteredVideos = await this.applyContentFiltering(videos);

      // Apply channel validation
      const validatedVideos = await this.applyChannelValidation(filteredVideos);

      return validatedVideos;
    } catch (error) {
      strapi.log.error('Error fetching videos by keyword:', error);
      throw error;
    }
  },

  /**
   * Apply content filtering using banned keywords
   * @param {Array} videos - Array of video objects
   * @returns {Promise<Array>} Filtered videos
   */
  async applyContentFiltering(videos) {
    try {
      // Get all active banned keywords from existing content-safety-keywords
      const bannedKeywords = await strapi.entityService.findMany('api::content-safety-keyword.content-safety-keyword', {
        filters: { active: true },
        fields: ['keyword', 'case_sensitive', 'match_type', 'applies_to']
      });

      if (!bannedKeywords || bannedKeywords.length === 0) {
        return videos;
      }

      return videos.filter(video => {
        return !bannedKeywords.some(bannedKeyword => {
          return this.checkKeywordMatch(video, bannedKeyword);
        });
      });
    } catch (error) {
      strapi.log.error('Error applying content filtering:', error);
      return videos; // Return unfiltered videos on error
    }
  },

  /**
   * Apply channel validation (trusted/banned channels)
   * @param {Array} videos - Array of video objects
   * @returns {Promise<Array>} Validated videos with status assignment
   */
  async applyChannelValidation(videos) {
    try {
      // Get trusted and banned channels from existing content types
      const [trustedChannels, bannedChannels] = await Promise.all([
        strapi.entityService.findMany('api::trusted-channel.trusted-channel', {
          filters: { active: true, platform: 'YouTube' },
          fields: ['channel_id', 'trust_level', 'auto_approve']
        }),
        strapi.entityService.findMany('api::banned-channel.banned-channel', {
          filters: { active: true, platform: 'YouTube' },
          fields: ['channel_id']
        })
      ]);

      const bannedChannelIds = new Set(bannedChannels.map(ch => ch.channel_id));
      const trustedChannelMap = new Map(trustedChannels.map(ch => [ch.channel_id, ch]));

      return videos.map(video => {
        // Check if channel is banned
        if (bannedChannelIds.has(video.channel_id)) {
          return null; // Filter out banned channels
        }

        // Check if channel is trusted
        const trustedChannel = trustedChannelMap.get(video.channel_id);
        if (trustedChannel) {
          video.videostatus = trustedChannel.auto_approve ? 'active' : 'pending';
          video.trust_level = trustedChannel.trust_level;
        } else {
          video.videostatus = 'pending'; // Default status for unknown channels
        }

        return video;
      }).filter(video => video !== null); // Remove banned channels
    } catch (error) {
      strapi.log.error('Error applying channel validation:', error);
      return videos.map(video => ({ ...video, videostatus: 'pending' })); // Return with pending status on error
    }
  },

  /**
   * Check if video content matches banned keyword
   * @param {Object} video - Video object
   * @param {Object} bannedKeyword - Banned keyword object
   * @returns {boolean} True if keyword matches (should be filtered)
   */
  checkKeywordMatch(video, bannedKeyword) {
    const { keyword, case_sensitive, match_type, applies_to } = bannedKeyword;
    
    let searchText = '';
    
    // Build search text based on applies_to setting
    switch (applies_to) {
      case 'Title':
        searchText = video.title || '';
        break;
      case 'Description':
        searchText = video.description || '';
        break;
      case 'Tags':
        searchText = Array.isArray(video.tags) ? video.tags.join(' ') : '';
        break;
      case 'Channel':
        searchText = video.channel_name || '';
        break;
      case 'All':
      default:
        searchText = `${video.title} ${video.description} ${video.channel_name}`;
        break;
    }

    const searchIn = case_sensitive ? searchText : searchText.toLowerCase();
    const searchFor = case_sensitive ? keyword : keyword.toLowerCase();

    // Apply match type
    switch (match_type) {
      case 'Exact':
        return searchIn === searchFor;
      case 'Starts With':
        return searchIn.startsWith(searchFor);
      case 'Ends With':
        return searchIn.endsWith(searchFor);
      case 'Regex':
        try {
          const regex = new RegExp(searchFor, case_sensitive ? 'g' : 'gi');
          return regex.test(searchIn);
        } catch (e) {
          return false;
        }
      case 'Contains':
      default:
        return searchIn.includes(searchFor);
    }
  },

  /**
   * Fetch videos from all active search keywords
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} Array of all fetched videos
   */
  async fetchVideosFromKeywords(options = {}) {
    try {
      // Get all active search keywords from existing trending-topics
      const searchKeywords = await strapi.entityService.findMany('api::trending-topic.trending-topic', {
        filters: { active: true },
        fields: ['name', 'priority'],
        sort: { priority: 'desc' }
      });

      if (!searchKeywords || searchKeywords.length === 0) {
        return [];
      }

      const allVideos = [];

      for (const keywordObj of searchKeywords) {
        try {
          const videos = await this.fetchVideosByKeyword(keywordObj.name, {
            maxResults: 10,
            relevanceLanguage: 'en',
            regionCode: 'TH',
            ...options
          });

          allVideos.push(...videos);
        } catch (error) {
          strapi.log.error(`Error fetching videos for keyword "${keywordObj.name}":`, error);
          continue;
        }
      }

      // Remove duplicates based on video_id
      const uniqueVideos = this.removeDuplicateVideos(allVideos);

      // Sort by relevance (trusted channels first, then by view count)
      return this.sortVideosByRelevance(uniqueVideos);
    } catch (error) {
      strapi.log.error('Error fetching videos from keywords:', error);
      throw error;
    }
  },

  /**
   * Remove duplicate videos based on video_id
   * @param {Array} videos - Array of video objects
   * @returns {Array} Unique videos
   */
  removeDuplicateVideos(videos) {
    const seen = new Set();
    return videos.filter(video => {
      if (seen.has(video.video_id)) {
        return false;
      }
      seen.add(video.video_id);
      return true;
    });
  },

  /**
   * Sort videos by relevance (trusted channels first, then by view count)
   * @param {Array} videos - Array of video objects
   * @returns {Array} Sorted videos
   */
  sortVideosByRelevance(videos) {
    return videos.sort((a, b) => {
      // Trusted channels first
      if (a.trust_level && !b.trust_level) return -1;
      if (!a.trust_level && b.trust_level) return 1;
      
      // Among trusted channels, sort by trust level
      if (a.trust_level && b.trust_level) {
        const trustOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const diff = trustOrder[a.trust_level] - trustOrder[b.trust_level];
        if (diff !== 0) return -diff;
      }

      // Then by view count
      return (b.view_count || 0) - (a.view_count || 0);
    });
  },

  /**
   * Update keyword usage statistics
   * @param {number} keywordId - Keyword ID
   * @param {number} resultCount - Number of results found
   */
  async updateKeywordStats(keywordId, resultCount) {
    try {
      const keyword = await strapi.entityService.findOne('api::video-search-keywords.video-search-keywords', keywordId);
      
      if (keyword) {
        const newUsageCount = (keyword.usage_count || 0) + 1;
        const newSuccessRate = resultCount > 0 ? 
          ((keyword.success_rate || 0) * (newUsageCount - 1) + (resultCount > 0 ? 100 : 0)) / newUsageCount :
          (keyword.success_rate || 0) * (newUsageCount - 1) / newUsageCount;

        await strapi.entityService.update('api::video-search-keywords.video-search-keywords', keywordId, {
          data: {
            usage_count: newUsageCount,
            success_rate: Math.round(newSuccessRate * 100) / 100,
            last_used: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      strapi.log.error('Error updating keyword stats:', error);
    }
  }
}));
