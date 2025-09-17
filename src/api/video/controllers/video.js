'use strict';

/**
 * videos controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::video.video', ({ strapi }) => ({
  /**
   * Override default update method to handle admin panel status changes
   * PUT /api/videos/:id
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    // If videostatus is being updated, add moderation metadata
    if (data.videostatus && ['active', 'rejected', 'pending', 'archived'].includes(data.videostatus)) {
      data.moderated_at = new Date();
      data.moderated_by = ctx.state.user?.id || 'admin';
    }

    // Call the default update method with enhanced data
    const result = await super.update(ctx);
    return result;
  },

  /**
   * Test endpoint to fetch videos by keyword
   * GET /api/featured-videos/test-fetch?keyword=thailand
   */
  async testFetch(ctx) {
    try {
      const { keyword = 'thailand travel', maxResults = 5 } = ctx.query;
      
      const videos = await strapi.service('api::video.video').fetchVideosByKeyword(keyword, {
        maxResults: parseInt(maxResults)
      });

      ctx.body = {
        success: true,
        keyword,
        count: videos.length,
        videos
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test endpoint to fetch videos from all keywords
   * GET /api/featured-videos/test-keywords
   */
  async testKeywords(ctx) {
    try {
      const videos = await strapi.service('api::video.video').fetchVideosFromKeywords();

      ctx.body = {
        success: true,
        count: videos.length,
        videos
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test endpoint to save fetched videos to database
   * POST /api/featured-videos/test-save
   */
  async testSave(ctx) {
    try {
      const { keyword = 'thailand travel', maxResults = 3 } = ctx.request.body;
      
      // Fetch videos
      const videos = await strapi.service('api::video.video').fetchVideosByKeyword(keyword, {
        maxResults: parseInt(maxResults)
      });

      // Save to database
      const savedVideos = [];
      for (const video of videos) {
        try {
          // Check if video already exists
          const existing = await strapi.entityService.findMany('api::video.video', {
            filters: { video_id: video.video_id },
            limit: 1
          });

          if (existing.length === 0) {
            const saved = await strapi.entityService.create('api::video.video', {
              data: video
            });
            savedVideos.push(saved);
          }
        } catch (saveError) {
          strapi.log.error('Error saving video:', saveError);
        }
      }

      ctx.body = {
        success: true,
        keyword,
        fetched: videos.length,
        saved: savedVideos.length,
        videos: savedVideos
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Service status endpoint
   * GET /api/featured-videos/test-status
   */
  async testStatus(ctx) {
    try {
      // Get database counts
      const counts = await Promise.all([
        strapi.entityService.findMany('api::video.video', { limit: 1 }),
        strapi.entityService.findMany('api::trusted-channels-video.trusted-channels-video', { limit: 1 }),
        strapi.entityService.findMany('api::banned-channels-video.banned-channels-video', { limit: 1 }),
        strapi.entityService.findMany('api::banned-keywords-video.banned-keywords-video', { limit: 1 }),
        strapi.entityService.findMany('api::video-search-keywords.video-search-keywords', { limit: 1 }),
        strapi.entityService.findMany('api::trending-tags-video.trending-tags-video', { limit: 1 })
      ]);

      const databaseCounts = {
        videos: counts[0]?.length || 0,
        trusted_channels: counts[1]?.length || 0,
        banned_channels: counts[2]?.length || 0,
        banned_keywords: counts[3]?.length || 0,
        search_keywords: counts[4]?.length || 0,
        trending_tags: counts[5]?.length || 0
      };

      // Get scheduler status if available
      const schedulerStatus = strapi.videoScheduler ? strapi.videoScheduler.getStatus() : null;

      ctx.body = {
        success: true,
        status: 'operational',
        youtube_api_configured: !!(process.env.YOUTUBE_API_KEY || 'AIzaSyCN2PoClgXJ0S2E6ixwcKUQiUYjekzl5G8'),
        database_counts: databaseCounts,
        scheduler_status: schedulerStatus,
        endpoints: {
          test_fetch: '/api/featured-videos/test-fetch?keyword=thailand',
          test_keywords: '/api/featured-videos/test-keywords',
          test_save: '/api/featured-videos/test-save',
          test_status: '/api/featured-videos/test-status',
          scheduler_status: '/api/featured-videos/scheduler-status',
          scheduler_trigger: '/api/featured-videos/scheduler-trigger'
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get scheduler status
   */
  async schedulerStatus(ctx) {
    try {
      if (!strapi.videoScheduler) {
        ctx.body = {
          success: false,
          error: 'Video scheduler not initialized'
        };
        return;
      }

      const status = strapi.videoScheduler.getStatus();
      ctx.body = {
        success: true,
        scheduler: status
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Manually trigger scheduler tasks
   */
  async schedulerTrigger(ctx) {
    try {
      if (!strapi.videoScheduler) {
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: 'Video scheduler not initialized'
        };
        return;
      }

      const { task = 'fetch' } = ctx.query;
      let result;

      switch (task) {
        case 'fetch':
          result = await strapi.videoScheduler.triggerVideoFetching();
          break;
        case 'cleanup':
          result = await strapi.videoScheduler.triggerVideoCleanup();
          break;
        default:
          ctx.status = 400;
          ctx.body = {
            success: false,
            error: 'Invalid task. Use: fetch, cleanup'
          };
          return;
      }

      ctx.body = {
        success: true,
        task,
        result
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get promoted videos for monetization
   * GET /api/videos/promoted
   */
  async getPromotedVideos(ctx) {
    try {
      const { 
        page = 1, 
        pageSize = 12, 
        includeExpired = false 
      } = ctx.query;

      const filters = {
        is_promoted: true,
        videostatus: 'active'
      };

      // Filter out expired promotions unless specifically requested
      if (!includeExpired) {
        filters.promotion_expiry = {
          $gte: new Date().toISOString()
        };
      }

      const promotedVideos = await strapi.entityService.findMany('api::video.video', {
        filters,
        sort: ['promotion_priority:desc', 'createdAt:desc'],
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        fields: ['video_id', 'title', 'thumbnail_url', 'channel_name', 'is_promoted', 'promotion_expiry', 'promotion_cost', 'sponsor_name']
      });

      ctx.body = {
        success: true,
        data: promotedVideos,
        meta: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Promote a video (Admin only)
   * PUT /api/videos/promote/:id
   */
  async promoteVideo(ctx) {
    try {
      const { id } = ctx.params;
      const { 
        promotion_expiry, 
        promotion_cost, 
        sponsor_name, 
        sponsor_contact,
        promotion_priority = 5 
      } = ctx.request.body;

      if (!promotion_expiry) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'promotion_expiry is required'
        };
        return;
      }

      const updatedVideo = await strapi.entityService.update('api::video.video', id, {
        data: {
          is_promoted: true,
          promotion_expiry: new Date(promotion_expiry).toISOString(),
          promotion_cost: parseFloat(promotion_cost) || 0,
          sponsor_name: sponsor_name || null,
          sponsor_contact: sponsor_contact || null,
          promotion_priority: parseInt(promotion_priority),
          promoted_at: new Date().toISOString(),
          promoted_by: ctx.state.user?.id || 'admin'
        }
      });

      strapi.log.info(`Video ${id} promoted by ${ctx.state.user?.email || 'admin'} until ${promotion_expiry}`);

      ctx.body = {
        success: true,
        data: updatedVideo,
        message: 'Video promoted successfully'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Remove promotion from a video (Admin only)
   * DELETE /api/videos/promote/:id
   */
  async removePromotion(ctx) {
    try {
      const { id } = ctx.params;

      const updatedVideo = await strapi.entityService.update('api::video.video', id, {
        data: {
          is_promoted: false,
          promotion_expiry: null,
          promotion_cost: null,
          sponsor_name: null,
          sponsor_contact: null,
          promotion_priority: null,
          promoted_at: null,
          promoted_by: null
        }
      });

      strapi.log.info(`Video ${id} promotion removed by ${ctx.state.user?.email || 'admin'}`);

      ctx.body = {
        success: true,
        data: updatedVideo,
        message: 'Video promotion removed successfully'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get monetization statistics
   * GET /api/videos/monetization/stats
   */
  async getMonetizationStats(ctx) {
    try {
      const [promotedCount, totalRevenue, activePromotions, expiredPromotions] = await Promise.all([
        strapi.entityService.count('api::video.video', {
          filters: { is_promoted: true }
        }),
        strapi.entityService.findMany('api::video.video', {
          filters: { is_promoted: true },
          fields: ['promotion_cost']
        }).then(videos => {
          if (Array.isArray(videos)) {
            return videos.reduce((sum, video) => sum + (video.promotion_cost || 0), 0);
          }
          return 0;
        }),
        strapi.entityService.count('api::video.video', {
          filters: { 
            is_promoted: true,
            promotion_expiry: { $gte: new Date().toISOString() }
          }
        }),
        strapi.entityService.count('api::video.video', {
          filters: { 
            is_promoted: true,
            promotion_expiry: { $lt: new Date().toISOString() }
          }
        })
      ]);

      // Get top sponsors
      const topSponsors = await strapi.entityService.findMany('api::video.video', {
        filters: { 
          is_promoted: true,
          sponsor_name: { $notNull: true }
        },
        fields: ['sponsor_name', 'promotion_cost'],
        limit: 100
      });

      const sponsorStats = Array.isArray(topSponsors) ? topSponsors.reduce((acc, video) => {
        const sponsor = video.sponsor_name;
        if (!acc[sponsor]) {
          acc[sponsor] = { name: sponsor, totalSpent: 0, videoCount: 0 };
        }
        acc[sponsor].totalSpent += video.promotion_cost || 0;
        acc[sponsor].videoCount += 1;
        return acc;
      }, {}) : {};

      const topSponsorsList = Object.values(sponsorStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      ctx.body = {
        success: true,
        stats: {
          promoted_videos: promotedCount,
          total_revenue: totalRevenue,
          active_promotions: activePromotions,
          expired_promotions: expiredPromotions,
          top_sponsors: topSponsorsList
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test hybrid approval logic
   * POST /api/featured-videos/test-hybrid-approval
   */
  async testHybridApproval(ctx) {
    try {
      const { keyword = 'thailand travel', maxResults = 3 } = ctx.request.body;
      
      // Fetch videos using the service
      const videos = await strapi.service('api::video.video').fetchVideosByKeyword(keyword, {
        maxResults: parseInt(maxResults)
      });

      // Analyze approval logic results
      const approvalStats = {
        total: videos.length,
        autoApproved: videos.filter(v => v.videostatus === 'active').length,
        pendingReview: videos.filter(v => v.videostatus === 'pending').length,
        rejected: videos.filter(v => v.videostatus === 'rejected').length
      };

      ctx.body = {
        success: true,
        keyword,
        approvalStats,
        hybridLogicWorking: approvalStats.total > 0,
        videos: videos.map(v => ({
          video_id: v.video_id,
          title: v.title,
          channel_name: v.channel_name,
          videostatus: v.videostatus,
          approval_reason: v.videostatus === 'active' ? 'Trusted channel' : 'Requires moderation'
        }))
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get videos pending review for admin moderation
   * GET /api/featured-videos/moderation/pending
   */
  async getModerationPending(ctx) {
    try {
      const { page = 1, pageSize = 25, sort = 'createdAt:desc' } = ctx.query;
      
      const pendingVideos = await strapi.entityService.findMany('api::video.video', {
        filters: {
          videostatus: 'pending'
        },
        sort: [sort],
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });

      const totalCount = await strapi.entityService.count('api::video.video', {
        filters: {
          videostatus: 'pending'
        }
      });

      ctx.body = {
        success: true,
        data: pendingVideos,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: totalCount,
            pageCount: Math.ceil(totalCount / parseInt(pageSize))
          }
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Update video status (approve/reject)
   * PUT /api/featured-videos/moderation/status/:id
   */
  async updateVideoStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, reason } = ctx.request.body;

      // Validate input parameters
      if (!id || isNaN(parseInt(id))) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid video ID. Must be a valid number'
        };
        return;
      }

      if (!status) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Status is required'
        };
        return;
      }

      // Validate status
      const validStatuses = ['active', 'rejected', 'pending', 'archived'];
      if (!validStatuses.includes(status.toLowerCase())) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        };
        return;
      }

      // Check if video exists
      const existingVideo = await strapi.entityService.findOne('api::video.video', id);
      if (!existingVideo) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: `Video with ID ${id} not found`
        };
        return;
      }

      // Validate status transition (optional business logic)
      const currentStatus = existingVideo.videostatus;
      const newStatus = status.toLowerCase();
      
      // Log status change for audit trail
      strapi.log.info(`Status change requested: Video ${id} (${existingVideo.title}) from "${currentStatus}" to "${newStatus}" by ${ctx.state.user?.username || 'admin'}`);

      // Update video status
      const updatedVideo = await strapi.entityService.update('api::video.video', id, {
        data: {
          videostatus: newStatus,
          moderation_reason: reason || null,
          moderated_at: new Date(),
          moderated_by: ctx.state.user?.id || 'admin'
        }
      });

      // Determine appropriate success message
      let message;
      switch (newStatus) {
        case 'active':
          message = 'Video approved and activated successfully';
          break;
        case 'rejected':
          message = 'Video rejected successfully';
          break;
        case 'pending':
          message = 'Video status set to pending review';
          break;
        case 'archived':
          message = 'Video archived successfully';
          break;
        default:
          message = 'Video status updated successfully';
      }

      ctx.body = {
        success: true,
        data: updatedVideo,
        message,
        previous_status: currentStatus,
        new_status: newStatus,
        updated_at: updatedVideo.updatedAt
      };

    } catch (error) {
      strapi.log.error('Error updating video status:', error);
      
      // Handle specific error types
      if (error.name === 'ValidationError') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Validation failed: ' + error.message
        };
      } else if (error.name === 'NotFoundError') {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Video not found'
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: 'Internal server error occurred while updating video status'
        };
      }
    }
  },

  /**
   * Bulk update video statuses
   * PUT /api/featured-videos/moderation/bulk-status
   */
  async bulkUpdateVideoStatus(ctx) {
    try {
      const { videoIds, status, reason } = ctx.request.body;

      if (!Array.isArray(videoIds) || videoIds.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'videoIds must be a non-empty array'
        };
        return;
      }

      if (!['active', 'rejected', 'pending', 'archived'].includes(status)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid status. Must be "active", "rejected", "pending", or "archived"'
        };
        return;
      }

      const updatePromises = videoIds.map(id => 
        strapi.entityService.update('api::video.video', id, {
          data: {
            videostatus: status,
            moderation_reason: reason || null,
            moderated_at: new Date(),
            moderated_by: ctx.state.user?.id || 'admin'
          }
        })
      );

      const updatedVideos = await Promise.all(updatePromises);

      ctx.body = {
        success: true,
        updated: updatedVideos.length,
        message: `${updatedVideos.length} videos ${status === 'active' ? 'approved' : 'rejected'} successfully`
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get moderation dashboard statistics
   * GET /api/featured-videos/moderation/stats
   */
  async getModerationStats(ctx) {
    try {
      const [pendingCount, activeCount, rejectedCount, totalCount] = await Promise.all([
        strapi.entityService.count('api::video.video', {
          filters: { videostatus: 'pending' }
        }),
        strapi.entityService.count('api::video.video', {
          filters: { videostatus: 'active' }
        }),
        strapi.entityService.count('api::video.video', {
          filters: { videostatus: 'rejected' }
        }),
        strapi.entityService.count('api::video.video')
      ]);

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentActivity = await strapi.entityService.findMany('api::video.video', {
        filters: {
          moderated_at: {
            $gte: yesterday.toISOString()
          }
        },
        sort: ['moderated_at:desc'],
        limit: 10,
        fields: ['video_id', 'title', 'videostatus', 'moderated_at', 'moderated_by']
      });

      ctx.body = {
        success: true,
        stats: {
          pending: pendingCount,
          active: activeCount,
          rejected: rejectedCount,
          total: totalCount,
          approval_rate: totalCount > 0 ? ((activeCount / (activeCount + rejectedCount)) * 100).toFixed(1) : 0
        },
        recent_activity: recentActivity
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get approved videos for frontend (excludes rejected)
   * GET /api/featured-videos/approved
   */
  async getApprovedVideos(ctx) {
    try {
      const { 
        page = 1, 
        pageSize = 12, 
        sort = 'createdAt:desc',
        category,
        search
      } = ctx.query;

      const filters = {
        videostatus: 'active'
      };

      if (category) {
        filters.category = {
          $containsi: category
        };
      }

      if (search) {
        filters.$or = [
          { title: { $containsi: search } },
          { description: { $containsi: search } },
          { channel_name: { $containsi: search } }
        ];
      }

      const approvedVideos = await strapi.entityService.findMany('api::video.video', {
        filters,
        sort: [sort],
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        fields: [
          'video_id', 'title', 'description', 'thumbnail_url', 
          'channel_name', 'video_published_at', 'duration', 
          'view_count', 'like_count', 'category', 'createdAt'
        ]
      });

      const totalCount = await strapi.entityService.count('api::video.video', {
        filters
      });

      ctx.body = {
        success: true,
        data: approvedVideos,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: totalCount,
            pageCount: Math.ceil(totalCount / parseInt(pageSize))
          }
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // ========== PHASE 5: FRONTEND WIDGET API ==========

  /**
   * Get display set of videos for frontend widget
   * GET /api/videos/display-set?ids=["video1","video2"]
   * Input: array of video_ids (selected in homepage widget settings)
   * Output: array of approved video objects only
   */
  async getDisplaySet(ctx) {
    try {
      const { ids } = ctx.query;
      
      // Validate input
      if (!ids) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Missing required parameter: ids'
        };
        return;
      }

      // Parse video IDs array
      let videoIds;
      try {
        videoIds = Array.isArray(ids) ? ids : JSON.parse(ids);
      } catch (parseError) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid ids format. Expected JSON array of video_ids'
        };
        return;
      }

      // Validate array
      if (!Array.isArray(videoIds) || videoIds.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'ids must be a non-empty array of video_ids'
        };
        return;
      }

      // Limit to reasonable number of videos
      if (videoIds.length > 50) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Maximum 50 video IDs allowed per request'
        };
        return;
      }

      // Fetch videos with strict filtering and promotion logic
      const displayVideos = await strapi.entityService.findMany('api::video.video', {
        filters: {
          video_id: {
            $in: videoIds
          },
          videostatus: 'active'
        },
        fields: [
          'video_id', 'title', 'description', 'thumbnail_url', 
          'channel_name', 'video_published_at', 'duration', 
          'view_count', 'like_count', 'category', 'featured', 
          'priority', 'createdAt', 'is_promoted', 'promotion_expiry',
          'promotion_start', 'sponsor_name'
        ]
      });

      // Filter out expired promotions and apply promotion logic
      const now = new Date();
      const processedVideos = displayVideos.map(video => {
        // Check if promotion is active
        const isPromotionActive = video.is_promoted && 
          (!video.promotion_start || new Date(video.promotion_start) <= now) &&
          (!video.promotion_expiry || new Date(video.promotion_expiry) > now);
        
        return {
          ...video,
          is_promoted: isPromotionActive,
          promotion_active: isPromotionActive
        };
      });

      // Sort: promoted videos first, then by priority, then by creation date
      processedVideos.sort((a, b) => {
        if (a.promotion_active !== b.promotion_active) {
          return b.promotion_active - a.promotion_active; // promoted first
        }
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // higher priority first
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // newer first
      });

      // Preserve order based on input array but prioritize promoted videos
      const orderedVideos = videoIds.map(videoId => 
        processedVideos.find(video => video.video_id === videoId)
      ).filter(Boolean); // Remove null/undefined entries

      // Final sort: promoted videos at the top, maintaining input order within each group
      orderedVideos.sort((a, b) => {
        if (a.promotion_active !== b.promotion_active) {
          return b.promotion_active - a.promotion_active;
        }
        return 0; // maintain original order for same promotion status
      });

      // Track missing/invalid video IDs
      const foundVideoIds = orderedVideos.map(video => video.video_id);
      const missingVideoIds = videoIds.filter(id => !foundVideoIds.includes(id));

      ctx.body = {
        success: true,
        data: orderedVideos,
        meta: {
          requested: videoIds.length,
          found: orderedVideos.length,
          missing: missingVideoIds.length,
          missing_ids: missingVideoIds.length > 0 ? missingVideoIds : undefined
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // ========== PHASE 6: MONETIZATION LAYER ==========

  /**
   * Promote a video (set promotion)
   * PUT /api/videos/promote/:id
   */
  async promoteVideo(ctx) {
    try {
      const { id } = ctx.params;
      const { 
        promotion_start, 
        promotion_expiry, 
        promotion_cost, 
        sponsor_name, 
        sponsor_contact 
      } = ctx.request.body;

      // Validate required fields
      if (!promotion_expiry) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'promotion_expiry is required'
        };
        return;
      }

      // Update video with promotion details
      const promotedVideo = await strapi.entityService.update('api::video.video', id, {
        data: {
          is_promoted: true,
          promotion_start: promotion_start || new Date(),
          promotion_expiry: new Date(promotion_expiry),
          promotion_cost: promotion_cost || 0,
          sponsor_name: sponsor_name || null,
          sponsor_contact: sponsor_contact || null
        }
      });

      ctx.body = {
        success: true,
        data: promotedVideo,
        message: 'Video promoted successfully'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Remove promotion from video
   * DELETE /api/videos/promote/:id
   */
  async unpromoteVideo(ctx) {
    try {
      const { id } = ctx.params;

      const unpromotedVideo = await strapi.entityService.update('api::video.video', id, {
        data: {
          is_promoted: false,
          promotion_start: null,
          promotion_expiry: null,
          promotion_cost: null,
          sponsor_name: null,
          sponsor_contact: null
        }
      });

      ctx.body = {
        success: true,
        data: unpromotedVideo,
        message: 'Video promotion removed successfully'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get promoted videos
   * GET /api/videos/promoted
   */
  async getPromotedVideos(ctx) {
    try {
      const { page = 1, pageSize = 10, includeExpired = false } = ctx.query;
      const now = new Date();

      let filters = {
        is_promoted: true
      };

      // Exclude expired promotions unless requested
      if (!includeExpired) {
        filters.$or = [
          { promotion_expiry: null },
          { promotion_expiry: { $gt: now.toISOString() } }
        ];
      }

      const promotedVideos = await strapi.entityService.findMany('api::video.video', {
        filters,
        sort: ['promotion_start:desc'],
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        fields: [
          'video_id', 'title', 'thumbnail_url', 'channel_name',
          'is_promoted', 'promotion_start', 'promotion_expiry',
          'promotion_cost', 'sponsor_name', 'videostatus', 'createdAt'
        ]
      });

      const totalCount = await strapi.entityService.count('api::video.video', {
        filters
      });

      ctx.body = {
        success: true,
        data: promotedVideos,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: totalCount,
            pageCount: Math.ceil(totalCount / parseInt(pageSize))
          }
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }
}));
