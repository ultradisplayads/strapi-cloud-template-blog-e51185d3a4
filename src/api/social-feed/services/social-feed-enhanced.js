'use strict';

/**
 * Enhanced Social Feed Service with AI-powered aggregation and filtering
 */

// @ts-nocheck

const { createCoreService } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreService('api::social-feed.social-feed', ({ strapi }) => ({
  /**
   * Main aggregation method that processes posts through the filtering pipeline
   * @param {Array} keywords - Keywords to search for
   * @param {boolean} forceRefresh - Force refresh from APIs
   * @returns {Promise<Array>} Processed and filtered posts
   */
  async aggregatePosts(keywords = ['Pattaya'], forceRefresh = false) {
    try {
      strapi.log.info('Starting enhanced social feed aggregation...');
      
      // Step 1: Load filtering rules
      // @ts-ignore
      const [bannedUsers, safetyKeywords, trustedChannels] = await Promise.all([
        // @ts-ignore
        this.loadBannedUsers(),
        // @ts-ignore
        this.loadSafetyKeywords(),
        // @ts-ignore
        this.loadTrustedChannels()
      ]);
      
      strapi.log.info(`Loaded rules: ${bannedUsers.length} banned users, ${safetyKeywords.length} safety keywords, ${trustedChannels.length} trusted channels`);
      
      // Step 2: Fetch from multiple sources
      // @ts-ignore
      const [twitterPosts, facebookPosts, instagramPosts] = await Promise.all([
        // @ts-ignore
        this.fetchFromTwitter(keywords),
        // @ts-ignore
        this.fetchFromFacebook(keywords),
        // @ts-ignore
        this.fetchFromInstagram(keywords)
      ]);
      
      const allPosts = [...twitterPosts, ...facebookPosts, ...instagramPosts];
      strapi.log.info(`Fetched ${allPosts.length} posts from all sources`);
      
      // Step 3: Process through filtering pipeline
      const processedPosts = [];
      
      for (const post of allPosts) {
        try {
          // @ts-ignore
          const processedPost = await this.processPostThroughPipeline(post, {
            bannedUsers,
            safetyKeywords,
            trustedChannels
          });
          
          if (processedPost) {
            processedPosts.push(processedPost);
          }
        } catch (error) {
          strapi.log.error(`Failed to process post ${post.post_id}:`, error.message);
        }
      }
      
      strapi.log.info(`Pipeline processing complete: ${processedPosts.length} posts passed all filters`);
      
      // Step 4: Save to database
      // @ts-ignore
      const savedPosts = await this.saveProcessedPosts(processedPosts);
      
      return savedPosts;
      
    } catch (error) {
      strapi.log.error('Enhanced aggregation failed:', error.message);
      return [];
    }
  },

  /**
   * Process a single post through the multi-layered filtering pipeline
   * @param {Object} post - Raw post data
   * @param {Object} rules - Filtering rules
   * @returns {Promise<Object|null>} Processed post or null if filtered out
   */
  async processPostThroughPipeline(post, rules) {
    const { bannedUsers, safetyKeywords, trustedChannels } = rules;
    
    // Layer 0: Source Filter (already handled in individual fetch methods)
    
    // Layer 1: Keyword Blocking
    // @ts-ignore
    if (this.isBlockedByKeywords(post.post_text, safetyKeywords)) {
      strapi.log.info(`Post ${post.post_id} blocked by keyword filter`);
      return null;
    }
    
    // Layer 2: Banned User Check
    // @ts-ignore
    if (this.isBannedUser(post.author_handle, post.source_platform, bannedUsers)) {
      strapi.log.info(`Post ${post.post_id} blocked - banned user: ${post.author_handle}`);
      return null;
    }
    
    // Layer 3: AI Analysis with Gemini
    // @ts-ignore
    const geminiService = require('../../../../services/gemini-ai')({ strapi });
    const aiAnalysis = await geminiService.analyzePost(post.post_text);
    
    // Apply AI analysis results
    if (!aiAnalysis.is_safe || aiAnalysis.sentiment === 'Negative') {
      strapi.log.info(`Post ${post.post_id} quarantined by AI analysis`);
      post.status = 'Quarantined';
    } else if (!aiAnalysis.is_english || !aiAnalysis.is_relevant) {
      strapi.log.info(`Post ${post.post_id} discarded - not English or not relevant`);
      return null;
    } else {
      // Check if from trusted channel
      // @ts-ignore
      const isTrustedChannel = this.isTrustedChannel(post.author_handle, post.source_platform, trustedChannels);
      
      if (isTrustedChannel) {
        post.status = 'Approved';
      } else {
        post.status = 'Pending Review';
      }
    }
    
    // Layer 4: Business Mention Detection and Linking
    if (aiAnalysis.business_name) {
      // @ts-ignore
      const business = await this.findBusinessByName(aiAnalysis.business_name);
      if (business) {
        post.mentioned_business = business.id;
        // Trigger business notification
        // @ts-ignore
        await this.notifyBusinessOfMention(business, post);
      }
    }
    
    // Set AI analysis and other metadata
    post.ai_analysis = aiAnalysis;
    post.sentiment = aiAnalysis.sentiment;
    post.category = aiAnalysis.category;
    post.processed_at = new Date();
    post.last_updated = new Date();
    
    return post;
  },

  /**
   * Load banned users from database
   * @returns {Promise<Array>} List of banned users
   */
  async loadBannedUsers() {
    try {
      // @ts-ignore
      const bannedUsers = await strapi.entityService.findMany('api::banned-social-users.banned-social-user', {
        filters: { active: true },
        fields: ['platform', 'user_handle_or_id']
      });
      return Array.isArray(bannedUsers) ? bannedUsers : [];
    } catch (error) {
      strapi.log.error('Failed to load banned users:', error.message);
      return [];
    }
  },

  /**
   * Load safety keywords from database
   * @returns {Promise<Array>} List of safety keywords
   */
  async loadSafetyKeywords() {
    try {
      // @ts-ignore
      const keywords = await strapi.entityService.findMany('api::content-safety-keywords.content-safety-keyword', {
        filters: { active: true },
        fields: ['term', 'case_sensitive', 'severity']
      });
      return Array.isArray(keywords) ? keywords : [];
    } catch (error) {
      strapi.log.error('Failed to load safety keywords:', error.message);
      return [];
    }
  },

  /**
   * Load trusted channels from database
   * @returns {Promise<Array>} List of trusted channels
   */
  async loadTrustedChannels() {
    try {
      // @ts-ignore
      const channels = await strapi.entityService.findMany('api::trusted-channels.trusted-channel', {
        filters: { active: true },
        fields: ['platform', 'channel_handle', 'auto_approve', 'trust_level']
      });
      return Array.isArray(channels) ? channels : [];
    } catch (error) {
      strapi.log.error('Failed to load trusted channels:', error.message);
      return [];
    }
  },

  /**
   * Check if post is blocked by keyword filters
   * @param {string} text - Post text
   * @param {Array} keywords - Safety keywords
   * @returns {boolean} True if blocked
   */
  isBlockedByKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    
    return keywords.some(keyword => {
      const searchText = keyword.case_sensitive ? text : lowerText;
      const searchTerm = keyword.case_sensitive ? keyword.term : keyword.term.toLowerCase();
      return searchText.includes(searchTerm);
    });
  },

  /**
   * Check if user is banned
   * @param {string} handle - User handle
   * @param {string} platform - Platform name
   * @param {Array} bannedUsers - List of banned users
   * @returns {boolean} True if banned
   */
  isBannedUser(handle, platform, bannedUsers) {
    return bannedUsers.some(user => 
      user.platform === platform && 
      user.user_handle_or_id === handle
    );
  },

  /**
   * Check if channel is trusted
   * @param {string} handle - Channel handle
   * @param {string} platform - Platform name
   * @param {Array} trustedChannels - List of trusted channels
   * @returns {boolean} True if trusted
   */
  isTrustedChannel(handle, platform, trustedChannels) {
    return trustedChannels.some(channel => 
      channel.platform === platform && 
      channel.channel_handle === handle
    );
  },

  /**
   * Find business by name
   * @param {string} businessName - Business name to search for
   * @returns {Promise<Object|null>} Business object or null
   */
  async findBusinessByName(businessName) {
    try {
      const businesses = await strapi.entityService.findMany('api::business.business', {
        filters: {
          $or: [
            { name: { $containsi: businessName } },
            { slug: { $containsi: businessName.toLowerCase().replace(/\s+/g, '-') } }
          ]
        },
        limit: 1
      });
      
      return businesses.length > 0 ? businesses[0] : null;
    } catch (error) {
      strapi.log.error('Failed to find business:', error.message);
      return null;
    }
  },

  /**
   * Notify business of social media mention
   * @param {Object} business - Business object
   * @param {Object} post - Post object
   */
  async notifyBusinessOfMention(business, post) {
    try {
      // This would integrate with your notification system
      strapi.log.info(`Business ${business.name} mentioned in post ${post.post_id}`);
      
      // You could send email, push notification, etc. here
      // await strapi.service('notification').sendBusinessMentionAlert(business, post);
      
    } catch (error) {
      strapi.log.error('Failed to notify business:', error.message);
    }
  },

  /**
   * Save processed posts to database
   * @param {Array} posts - Processed posts
   * @returns {Promise<Array>} Saved posts
   */
  async saveProcessedPosts(posts) {
    const savedPosts = [];
    
    for (const post of posts) {
      try {
        // Check if post already exists
        // @ts-ignore
        const existing = await strapi.entityService.findMany('api::social-posts.social-post', {
          filters: { post_id: post.post_id }
        });
        
        const existingArray = Array.isArray(existing) ? existing : [];
        
        if (existingArray.length === 0) {
          // @ts-ignore
          const savedPost = await strapi.entityService.create('api::social-posts.social-post', {
            data: post
          });
          savedPosts.push(savedPost);
          // @ts-ignore
          strapi.log.info(`Saved new post: ${savedPost.post_id || 'unknown'}`);
        } else {
          // Update existing post
          // @ts-ignore
          const updatedPost = await strapi.entityService.update('api::social-posts.social-post', existingArray[0].id, {
            data: {
              ...post,
              last_updated: new Date()
            }
          });
          savedPosts.push(updatedPost);
          // @ts-ignore
          strapi.log.info(`Updated existing post: ${updatedPost.post_id || 'unknown'}`);
        }
      } catch (error) {
        strapi.log.error(`Failed to save post ${post.post_id}:`, error.message);
      }
    }
    
    return savedPosts;
  },

  /**
   * Fetch posts from Twitter/X
   * @param {Array} keywords - Search keywords
   * @returns {Promise<Array>} Twitter posts
   */
  async fetchFromTwitter(keywords) {
    try {
      const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
      
      if (!twitterBearerToken) {
        strapi.log.warn('Twitter Bearer Token not configured, using fallback data');
        // @ts-ignore
        return this.getFallbackTwitterPosts(keywords);
      }
      
      const query = keywords.map(k => `"${k}"`).join(' OR ');
      const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,public_metrics,author_id,context_annotations&user.fields=username,name,verified&expansions=author_id&lang=en`;
      
      const response = await fetch(twitterUrl, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        // @ts-ignore
        return this.getFallbackTwitterPosts(keywords);
      }
      
      // Transform Twitter API response
      return data.data.map(tweet => {
        const author = data.includes?.users?.find(u => u.id === tweet.author_id);
        return {
          source_platform: 'X',
          post_id: `twitter_${tweet.id}`,
          author_name: author?.name || 'Unknown User',
          author_handle: `@${author?.username || 'unknown'}`,
          author_avatar_url: null, // Would need additional API call
          post_text: tweet.text,
          post_url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
          timestamp: new Date(tweet.created_at),
          engagement_metrics: {
            likes: tweet.public_metrics?.like_count || 0,
            comments: tweet.public_metrics?.reply_count || 0,
            shares: tweet.public_metrics?.retweet_count || 0,
            views: tweet.public_metrics?.impression_count || 0
          },
          verified_author: author?.verified || false,
          // @ts-ignore
          hashtags: this.extractHashtags(tweet.text),
          // @ts-ignore
          location: this.extractLocation(tweet.text)
        };
      });
      
    } catch (error) {
      strapi.log.error('Failed to fetch from Twitter:', error.message);
      // @ts-ignore
      return this.getFallbackTwitterPosts(keywords);
    }
  },

  /**
   * Fetch posts from Facebook (placeholder - would need Facebook API integration)
   * @param {Array} keywords - Search keywords
   * @returns {Promise<Array>} Facebook posts
   */
  async fetchFromFacebook(keywords) {
    // Placeholder for Facebook API integration
    // @ts-ignore
    return this.getFallbackFacebookPosts(keywords);
  },

  /**
   * Fetch posts from Instagram (placeholder - would need Instagram API integration)
   * @param {Array} keywords - Search keywords
   * @returns {Promise<Array>} Instagram posts
   */
  async fetchFromInstagram(keywords) {
    // Placeholder for Instagram API integration
    // @ts-ignore
    return this.getFallbackInstagramPosts(keywords);
  },

  /**
   * Get fallback Twitter posts
   * @param {Array} keywords - Search keywords
   * @returns {Array} Fallback posts
   */
  getFallbackTwitterPosts(keywords) {
    return [
      {
        source_platform: 'X',
        post_id: `twitter_fallback_${Date.now()}`,
        author_name: 'Pattaya Explorer',
        author_handle: '@pattaya_explorer',
        author_avatar_url: null,
        post_text: `Just discovered an amazing hidden beach in Pattaya! The water is crystal clear and perfect for snorkeling 🏖️ #Pattaya #Thailand #Beach`,
        post_url: 'https://twitter.com/pattaya_explorer/status/1234567890',
        timestamp: new Date(),
        engagement_metrics: {
          likes: 45,
          comments: 12,
          shares: 8,
          views: 1200
        },
        verified_author: true,
        hashtags: ['Pattaya', 'Thailand', 'Beach', 'Snorkeling'],
        location: 'Pattaya, Thailand'
      }
    ];
  },

  /**
   * Get fallback Facebook posts
   * @param {Array} keywords - Search keywords
   * @returns {Array} Fallback posts
   */
  getFallbackFacebookPosts(keywords) {
    return [
      {
        source_platform: 'Facebook',
        post_id: `facebook_fallback_${Date.now()}`,
        author_name: 'Pattaya Nightlife',
        author_handle: '@pattaya_nightlife',
        author_avatar_url: null,
        post_text: `The nightlife scene in Pattaya is absolutely incredible! From rooftop bars to beach clubs, there's something for everyone 🌃 #Pattaya #Nightlife #Thailand`,
        post_url: 'https://facebook.com/pattaya_nightlife/posts/1234567890',
        timestamp: new Date(Date.now() - 3600000),
        engagement_metrics: {
          likes: 156,
          comments: 34,
          shares: 28,
          views: 5000
        },
        verified_author: true,
        hashtags: ['Pattaya', 'Nightlife', 'Thailand', 'BeachClubs'],
        location: 'Pattaya, Thailand'
      }
    ];
  },

  /**
   * Get fallback Instagram posts
   * @param {Array} keywords - Search keywords
   * @returns {Array} Fallback posts
   */
  getFallbackInstagramPosts(keywords) {
    return [
      {
        source_platform: 'Instagram',
        post_id: `instagram_fallback_${Date.now()}`,
        author_name: 'Foodie in Pattaya',
        author_handle: '@pattaya_foodie',
        author_avatar_url: null,
        post_text: `The best pad thai I've ever had! This local restaurant in Pattaya serves authentic Thai cuisine that will blow your mind 🍜 #Pattaya #Food #ThaiCuisine`,
        post_url: 'https://instagram.com/p/abc123',
        timestamp: new Date(Date.now() - 7200000),
        engagement_metrics: {
          likes: 89,
          comments: 23,
          shares: 15,
          views: 3000
        },
        verified_author: false,
        hashtags: ['Pattaya', 'Food', 'ThaiCuisine', 'PadThai'],
        location: 'Pattaya, Thailand'
      }
    ];
  },

  /**
   * Extract hashtags from text
   * @param {string} text - Text to extract hashtags from
   * @returns {Array} Array of hashtags
   */
  extractHashtags(text) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  },

  /**
   * Extract location from text
   * @param {string} text - Text to extract location from
   * @returns {string} Location string
   */
  extractLocation(text) {
    const locationKeywords = ['Pattaya', 'Thailand', 'Jomtien', 'Walking Street', 'Pattaya Beach'];
    const foundLocation = locationKeywords.find(loc => 
      text.toLowerCase().includes(loc.toLowerCase())
    );
    return foundLocation ? `${foundLocation}, Thailand` : 'Pattaya, Thailand';
  }
}));
