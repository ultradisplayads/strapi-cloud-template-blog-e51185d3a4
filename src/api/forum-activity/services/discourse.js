'use strict';

/**
 * Discourse API Service
 * Handles integration with Discourse forum platform
 */

class DiscourseService {
  constructor() {
    this.apiKey = process.env.DISCOURSE_API_KEY;
    this.apiUsername = process.env.DISCOURSE_API_USERNAME || 'system';
    this.baseUrl = process.env.DISCOURSE_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutes
  }

  /**
   * Get latest topics from Discourse
   */
  async getLatestTopics(limit = 10) {
    try {
      if (!this.baseUrl) {
        strapi.log.warn('Discourse base URL not configured, using fallback data');
        return this.getFallbackTopics();
      }

      const cacheKey = `latest_topics_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/latest.json?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Api-Key': this.apiKey,
          'Api-Username': this.apiUsername,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Discourse API error: ${response.status}`);
      }

      const data = await response.json();
      const topics = this.transformTopics(data.topic_list?.topics || []);
      
      this.setCache(cacheKey, topics);
      return topics;

    } catch (error) {
      strapi.log.error('Error fetching Discourse topics:', error);
      return this.getFallbackTopics();
    }
  }

  /**
   * Get top topics from Discourse
   */
  async getTopTopics(limit = 10) {
    try {
      if (!this.baseUrl) {
        strapi.log.warn('Discourse base URL not configured, using fallback data');
        return this.getFallbackTopics();
      }

      const cacheKey = `top_topics_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/top.json?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Api-Key': this.apiKey,
          'Api-Username': this.apiUsername,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Discourse API error: ${response.status}`);
      }

      const data = await response.json();
      const topics = this.transformTopics(data.topic_list?.topics || []);
      
      this.setCache(cacheKey, topics);
      return topics;

    } catch (error) {
      strapi.log.error('Error fetching Discourse top topics:', error);
      return this.getFallbackTopics();
    }
  }

  /**
   * Transform Discourse topics to our format
   */
  transformTopics(topics) {
    return topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      url: `${this.baseUrl}/t/${topic.slug}/${topic.id}`,
      category_id: topic.category_id,
      author: {
        username: topic.last_poster_username || topic.posters?.[0]?.user?.username || 'Unknown',
        avatar_template: topic.last_poster_avatar_template || topic.posters?.[0]?.user?.avatar_template,
        name: topic.last_poster_name || topic.posters?.[0]?.user?.name
      },
      reply_count: topic.reply_count || 0,
      view_count: topic.views || 0,
      like_count: topic.like_count || 0,
      last_activity: topic.last_posted_at || topic.created_at,
      created_at: topic.created_at,
      is_hot: this.isHotTopic(topic),
      is_pinned: topic.pinned || false,
      tags: topic.tags || [],
      excerpt: topic.excerpt || ''
    }));
  }

  /**
   * Determine if a topic is "hot" based on recent activity
   */
  isHotTopic(topic) {
    const now = new Date();
    const lastActivity = new Date(topic.last_posted_at || topic.created_at);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Hot if more than 5 replies in the last hour
    return topic.reply_count > 5 && hoursSinceActivity < 1;
  }

  /**
   * Get user avatar URL from Discourse avatar template
   */
  getAvatarUrl(avatarTemplate, size = 48) {
    if (!avatarTemplate || !this.baseUrl) {
      return null;
    }
    
    return `${this.baseUrl}${avatarTemplate.replace('{size}', size)}`;
  }

  /**
   * Get fallback topics when API is unavailable
   */
  getFallbackTopics() {
    return [
      {
        id: 1,
        title: "Best restaurants in Pattaya",
        slug: "best-restaurants-pattaya",
        url: "#",
        category_id: 1,
        author: {
          username: "foodie123",
          avatar_template: null,
          name: "Food Lover"
        },
        reply_count: 15,
        view_count: 234,
        like_count: 8,
        last_activity: new Date().toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_hot: true,
        is_pinned: false,
        tags: ["food", "restaurants"],
        excerpt: "Looking for recommendations for the best restaurants in Pattaya..."
      },
      {
        id: 2,
        title: "Visa extension process",
        slug: "visa-extension-process",
        url: "#",
        category_id: 2,
        author: {
          username: "traveler456",
          avatar_template: null,
          name: "Travel Expert"
        },
        reply_count: 8,
        view_count: 156,
        like_count: 3,
        last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_hot: false,
        is_pinned: true,
        tags: ["visa", "immigration"],
        excerpt: "Step-by-step guide for extending your visa in Thailand..."
      },
      {
        id: 3,
        title: "Nightlife recommendations",
        slug: "nightlife-recommendations",
        url: "#",
        category_id: 3,
        author: {
          username: "nightowl789",
          avatar_template: null,
          name: "Night Life Enthusiast"
        },
        reply_count: 12,
        view_count: 189,
        like_count: 6,
        last_activity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        is_hot: true,
        is_pinned: false,
        tags: ["nightlife", "bars", "clubs"],
        excerpt: "Best places to experience Pattaya's vibrant nightlife..."
      }
    ];
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new DiscourseService();
