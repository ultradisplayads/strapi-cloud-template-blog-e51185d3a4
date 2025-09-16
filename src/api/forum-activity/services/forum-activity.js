'use strict';

/**
 * forum-activity service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const discourseService = require('./discourse');

module.exports = createCoreService('api::forum-activity.forum-activity', ({ strapi }) => ({
  /**
   * Get enhanced forum activity data from real Strapi forum topics
   */
  async getEnhancedForumActivity(limit = 5) {
    try {
      // Get real forum topics from Strapi
      const realTopics = await this.getRealForumTopics(limit);
      
      // Get pinned threads for additional content
      const pinnedThreads = await this.getPinnedThreads();
      
      // Combine real topics and pinned threads
      const allTopics = [...realTopics];
      const realTopicIds = realTopics.map(t => t.id);
      
      // Add pinned threads that aren't already in real topics
      pinnedThreads.forEach(thread => {
        if (!realTopicIds.includes(thread.id)) {
          allTopics.push(thread);
        }
      });
      
      // Sort by priority (pinned first, then by activity)
      return allTopics
        .sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        })
        .slice(0, limit);

    } catch (error) {
      strapi.log.error('Error getting enhanced forum activity:', error);
      return this.getFallbackData();
    }
  },

  /**
   * Get real forum topics from Strapi database
   */
  async getRealForumTopics(limit = 5) {
    try {
      // @ts-ignore
      const topics = await strapi.entityService.findMany('api::forum-topic.forum-topic', {
        populate: [
          'author',
          'category', 
          'lastPost',
          'lastPost.author',
          'reactions',
          'reactions.user'
        ],
        sort: { lastActivity: 'desc' },
        limit: limit
      });

      if (!Array.isArray(topics)) {
        return [];
      }

      return topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        url: `/forum/${topic.id}`,
        category_id: topic.category?.id || 1,
        author: {
          username: topic.author?.username || 'Unknown User',
          name: topic.author?.username || 'Unknown User',
          avatar_template: null
        },
        reply_count: topic.postCount || 0,
        view_count: topic.viewCount || 0,
        like_count: topic.reactionCounts?.like || 0,
        last_activity: topic.lastActivity || topic.createdAt,
        created_at: topic.createdAt,
        is_hot: topic.isHot || false,
        is_pinned: topic.isPinned || false,
        tags: [],
        excerpt: topic.excerpt || topic.content?.substring(0, 150) || '',
        category_info: {
          name: topic.category?.name || 'General',
          icon: '💬',
          color: '#3B82F6'
        },
        // Store original topic data for reactions
        _originalTopic: topic
      }));
    } catch (error) {
      strapi.log.error('Error getting real forum topics:', error);
      return [];
    }
  },

  /**
   * Get pinned forum threads
   */
  async getPinnedThreads() {
    try {
      //@ts-ignore
      const pinnedThreads = await strapi.entityService.findMany('api::pinned-forum-thread.pinned-forum-thread', {
        filters: { is_active: true },
        sort: { display_order: 'asc' }
      });

      if (!Array.isArray(pinnedThreads)) {
        return [];
      }

      return pinnedThreads.map(thread => ({
        id: `pinned_${thread.id}`,
        // @ts-ignore - Custom content type properties
        title: thread.display_title || 'Untitled',
        // @ts-ignore - Custom content type properties
        url: thread.thread_url || '#',
        // @ts-ignore - Custom content type properties
        category_id: thread.category_id || 12,
        author: {
          // @ts-ignore - Custom content type properties
          username: thread.author_name || 'Admin',
          avatar_template: null,
          // @ts-ignore - Custom content type properties
          name: thread.author_name || 'Admin'
        },
        // @ts-ignore - Custom content type properties
        reply_count: thread.reply_count || 0,
        view_count: 0,
        like_count: 0,
        // @ts-ignore - Custom content type properties
        last_activity: thread.last_activity || thread.createdAt,
        created_at: thread.createdAt,
        is_hot: false,
        is_pinned: true,
        tags: [],
        excerpt: '',
        // @ts-ignore - Custom content type properties
        category_info: this.getCategoryInfo(thread.category_id || 12)
      }));
    } catch (error) {
      strapi.log.error('Error getting pinned threads:', error);
      return [];
    }
  },

  /**
   * Get forum categories
   */
  async getForumCategories() {
    try {
      // @ts-ignore - Custom content type not recognized by TypeScript
      const categories = await strapi.entityService.findMany('api::forum-category.forum-category', {
        filters: { is_active: true },
        sort: { sort_order: 'asc' }
      });

      if (!Array.isArray(categories)) {
        return {};
      }

      return categories.reduce((acc, cat) => {
        // @ts-ignore - Custom content type properties
        acc[cat.category_id_from_discourse || 12] = {
          // @ts-ignore - Custom content type properties
          name: cat.category_name || 'General',
          // @ts-ignore - Custom content type properties
          icon: cat.display_icon || '💬',
          // @ts-ignore - Custom content type properties
          color: cat.display_color || '#F8C471'
        };
        return acc;
      }, {});
    } catch (error) {
      strapi.log.error('Error getting forum categories:', error);
      return {};
    }
  },

  /**
   * Process topics with category matching and hot thread logic
   */
  async processTopics(topics, categories) {
    return topics.map(topic => {
      const categoryInfo = this.getCategoryInfo(topic.category_id, categories);
      
      return {
        ...topic,
        category_info: categoryInfo,
        avatar_url: discourseService.getAvatarUrl(topic.author.avatar_template),
        // Enhanced hot thread logic
        is_hot: this.calculateHotStatus(topic)
      };
    });
  },

  /**
   * Get category information
   */
  getCategoryInfo(categoryId, categories = null) {
    if (!categories) {
      // Default categories if not provided
      const defaultCategories = {
        1: { name: 'Food & Dining', icon: '🍴', color: '#FF6B6B' },
        2: { name: 'Visa & Legal', icon: '🛂', color: '#4ECDC4' },
        3: { name: 'Nightlife', icon: '🍸', color: '#45B7D1' },
        4: { name: 'Transportation', icon: '🚗', color: '#96CEB4' },
        5: { name: 'Events', icon: '🎉', color: '#FFEAA7' },
        6: { name: 'Living', icon: '🏠', color: '#DDA0DD' },
        7: { name: 'Accommodation', icon: '🏨', color: '#98D8C8' },
        8: { name: 'Shopping', icon: '🛍️', color: '#F7DC6F' },
        9: { name: 'Health', icon: '🏥', color: '#BB8FCE' },
        10: { name: 'Entertainment', icon: '🎬', color: '#85C1E9' },
        11: { name: 'Sports', icon: '⚽', color: '#82E0AA' },
        12: { name: 'General', icon: '💬', color: '#F8C471' }
      };
      return defaultCategories[categoryId] || { name: 'General', icon: '💬', color: '#F8C471' };
    }
    
    return categories[categoryId] || { name: 'General', icon: '💬', color: '#F8C471' };
  },

  /**
   * Calculate hot thread status based on enhanced logic
   */
  calculateHotStatus(topic) {
    const now = new Date();
    const lastActivity = new Date(topic.last_activity);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Hot if:
    // 1. More than 5 replies in the last hour, OR
    // 2. More than 10 replies in the last 2 hours, OR
    // 3. More than 20 replies in the last 6 hours
    if (topic.reply_count > 5 && hoursSinceActivity < 1) return true;
    if (topic.reply_count > 10 && hoursSinceActivity < 2) return true;
    if (topic.reply_count > 20 && hoursSinceActivity < 6) return true;
    
    return false;
  },

  /**
   * Get fallback data when services are unavailable
   */
  getFallbackData() {
    return [
      {
        id: 1,
        title: "Best restaurants in Pattaya",
        url: "#",
        category_id: 1,
        author: {
          username: "foodie123",
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
        excerpt: "Looking for recommendations for the best restaurants in Pattaya...",
        category_info: { name: 'Food & Dining', icon: '🍴', color: '#FF6B6B' },
        avatar_url: null
      },
      {
        id: 2,
        title: "Visa extension process",
        url: "#",
        category_id: 2,
        author: {
          username: "traveler456",
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
        excerpt: "Step-by-step guide for extending your visa in Thailand...",
        category_info: { name: 'Visa & Legal', icon: '🛂', color: '#4ECDC4' },
        avatar_url: null
      }
    ];
  }
}));
