'use strict';

/**
 * Video Scheduler Service
 * Automated video fetching and management for Featured Videos Widget
 */

const cron = require('node-cron');

class VideoScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTasks = new Map();
    this.lastRun = null;
    this.nextRun = null;
  }

  /**
   * Initialize the scheduler with Phase 3 requirements
   */
  async initialize() {
    try {
      // Phase 3: Daytime fetching every 30 minutes (06:00-23:00)
      this.scheduleVideoFetching('*/30 6-23 * * *', 'daytime-fetch');
      
      // Phase 3: Nighttime fetching every 2 hours (23:01-05:59)
      this.scheduleVideoFetching('0 */2 0-5 * * *', 'nighttime-fetch');
      
      // Phase 3: Trending mode - check for active trending tags every 5 minutes
      this.scheduleTrendingMode('*/5 * * * *', 'trending-mode');
      
      // Maintenance: Daily cleanup at 2 AM
      this.scheduleVideoCleanup('0 2 * * *', 'daily-cleanup');
      
      // Statistics update every 6 hours
      this.scheduleStatsUpdate('0 */6 * * *', 'stats-update');

      strapi.log.info('Phase 3 Video Scheduler initialized successfully');
      this.isRunning = true;
    } catch (error) {
      strapi.log.error('Error initializing Phase 3 Video Scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule automated video fetching
   * @param {string} cronExpression - Cron expression for scheduling
   * @param {string} taskId - Unique identifier for the task
   */
  scheduleVideoFetching(cronExpression, taskId) {
    const task = cron.schedule(cronExpression, async () => {
      try {
        strapi.log.info(`Starting scheduled video fetching: ${taskId}`);
        await this.performVideoFetching();
        this.lastRun = new Date();
        strapi.log.info(`Completed scheduled video fetching: ${taskId}`);
      } catch (error) {
        strapi.log.error(`Error in scheduled video fetching ${taskId}:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok'
    });

    this.scheduledTasks.set(taskId, task);
    task.start();
    
    strapi.log.info(`Scheduled video fetching task: ${taskId} with cron: ${cronExpression}`);
  }

  /**
   * Schedule video cleanup (remove old/inactive videos)
   * @param {string} cronExpression - Cron expression for scheduling
   * @param {string} taskId - Unique identifier for the task
   */
  scheduleVideoCleanup(cronExpression, taskId) {
    const task = cron.schedule(cronExpression, async () => {
      try {
        strapi.log.info(`Starting scheduled video cleanup: ${taskId}`);
        await this.performVideoCleanup();
        strapi.log.info(`Completed scheduled video cleanup: ${taskId}`);
      } catch (error) {
        strapi.log.error(`Error in scheduled video cleanup ${taskId}:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok'
    });

    this.scheduledTasks.set(taskId, task);
    task.start();
    
    strapi.log.info(`Scheduled video cleanup task: ${taskId} with cron: ${cronExpression}`);
  }

  /**
   * Schedule keyword statistics update
   * @param {string} cronExpression - Cron expression for scheduling
   * @param {string} taskId - Unique identifier for the task
   */
  scheduleStatsUpdate(cronExpression, taskId) {
    const task = cron.schedule(cronExpression, async () => {
      try {
        strapi.log.info(`Starting scheduled stats update: ${taskId}`);
        await this.performStatsUpdate();
        strapi.log.info(`Completed scheduled stats update: ${taskId}`);
      } catch (error) {
        strapi.log.error(`Error in scheduled stats update ${taskId}:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok'
    });

    this.scheduledTasks.set(taskId, task);
    task.start();
    
    strapi.log.info(`Scheduled stats update task: ${taskId} with cron: ${cronExpression}`);
  }

  /**
   * Schedule trending mode - intensive fetching for active trending tags
   * @param {string} cronExpression - Cron expression for scheduling
   * @param {string} taskId - Unique identifier for the task
   */
  scheduleTrendingMode(cronExpression, taskId) {
    const task = cron.schedule(cronExpression, async () => {
      try {
        const activeTrendingTags = await this.checkActiveTrendingTags();
        if (activeTrendingTags.length > 0) {
          strapi.log.info(`Starting trending mode fetch: ${taskId} - ${activeTrendingTags.length} active tags`);
          await this.performTrendingFetch(activeTrendingTags);
          strapi.log.info(`Completed trending mode fetch: ${taskId}`);
        }
      } catch (error) {
        strapi.log.error(`Error in trending mode ${taskId}:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok'
    });

    this.scheduledTasks.set(taskId, task);
    task.start();
    
    strapi.log.info(`Scheduled trending mode task: ${taskId} with cron: ${cronExpression}`);
  }

  /**
   * Perform automated video fetching from all active search keywords
   */
  async performVideoFetching() {
    try {
      const videosService = strapi.service('api::videos.videos');
      
      // Fetch videos from all active search keywords
      const videos = await videosService.fetchVideosFromKeywords({
        maxResults: 5, // Limit to 5 videos per keyword to manage quota
        saveToDatabase: true
      });

      strapi.log.info(`Automated video fetching completed: ${videos.length} videos processed`);
      
      // Update scheduler statistics
      await this.updateSchedulerStats('video_fetch', videos.length);
      
      return videos;
    } catch (error) {
      strapi.log.error('Error in automated video fetching:', error);
      await this.updateSchedulerStats('video_fetch_error', 1);
      throw error;
    }
  }

  /**
   * Perform video cleanup - remove old or inactive videos
   */
  async performVideoCleanup() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Remove videos older than 30 days with status 'inactive'
      const deletedVideos = await strapi.entityService.deleteMany('api::videos.videos', {
        filters: {
          $and: [
            { status: 'inactive' },
            { createdAt: { $lt: thirtyDaysAgo.toISOString() } }
          ]
        }
      });

      strapi.log.info(`Video cleanup completed: ${deletedVideos?.count || 0} videos removed`);
      
      // Update scheduler statistics
      await this.updateSchedulerStats('video_cleanup', deletedVideos?.count || 0);
      
      return deletedVideos;
    } catch (error) {
      strapi.log.error('Error in video cleanup:', error);
      await this.updateSchedulerStats('video_cleanup_error', 1);
      throw error;
    }
  }

  /**
   * Perform keyword statistics update
   */
  async performStatsUpdate() {
    try {
      // Get all search keywords
      const keywords = await strapi.entityService.findMany('api::video-search-keywords.video-search-keywords', {
        filters: { active: true }
      });

      let updatedCount = 0;
      
      for (const keyword of keywords) {
        try {
          // Calculate success rate based on recent usage
          const recentVideos = await strapi.entityService.findMany('api::videos.videos', {
            filters: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } // Last 7 days
            }
          });

          const successRate = recentVideos.length > 0 ? Math.min(100, (recentVideos.length / keyword.usage_count) * 100) : keyword.success_rate;

          // Update keyword statistics
          await strapi.entityService.update('api::video-search-keywords.video-search-keywords', keyword.id, {
            data: {
              success_rate: Math.round(successRate),
              last_used: new Date().toISOString()
            }
          });

          updatedCount++;
        } catch (error) {
          strapi.log.error(`Error updating stats for keyword ${keyword.keyword}:`, error);
        }
      }

      strapi.log.info(`Keyword stats update completed: ${updatedCount} keywords updated`);
      
      // Update scheduler statistics
      await this.updateSchedulerStats('stats_update', updatedCount);
      
      return updatedCount;
    } catch (error) {
      strapi.log.error('Error in keyword stats update:', error);
      await this.updateSchedulerStats('stats_update_error', 1);
      throw error;
    }
  }

  /**
   * Update scheduler statistics (could be stored in database or logs)
   * @param {string} operation - Operation type
   * @param {number} count - Count of items processed
   */
  async updateSchedulerStats(operation, count) {
    try {
      // For now, just log the statistics
      // In production, you might want to store these in a dedicated statistics table
      strapi.log.info(`Scheduler Stats - ${operation}: ${count} at ${new Date().toISOString()}`);
    } catch (error) {
      strapi.log.error('Error updating scheduler stats:', error);
    }
  }

  /**
   * Stop a specific scheduled task
   * @param {string} taskId - Task identifier
   */
  stopTask(taskId) {
    const task = this.scheduledTasks.get(taskId);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(taskId);
      strapi.log.info(`Stopped scheduled task: ${taskId}`);
      return true;
    }
    return false;
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    for (const [taskId, task] of this.scheduledTasks) {
      task.stop();
      strapi.log.info(`Stopped scheduled task: ${taskId}`);
    }
    this.scheduledTasks.clear();
    this.isRunning = false;
    strapi.log.info('All scheduled tasks stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.scheduledTasks.keys()),
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      taskCount: this.scheduledTasks.size
    };
  }

  /**
   * Manually trigger video fetching (for testing)
   */
  async triggerVideoFetching() {
    strapi.log.info('Manually triggering video fetching');
    return await this.performVideoFetching();
  }

  /**
   * Manually trigger video cleanup (for testing)
   */
  async triggerVideoCleanup() {
    strapi.log.info('Manually triggering video cleanup');
    return await this.performVideoCleanup();
  }

  /**
   * Check for active trending tags
   * @returns {Promise<Array>} Active trending tags
   */
  async checkActiveTrendingTags() {
    try {
      const activeTags = await strapi.entityService.findMany('api::trending-tags-video.trending-tags-video', {
        filters: { 
          active: true,
          is_trending: true
        },
        fields: ['tag', 'priority', 'fetch_frequency']
      });

      return Array.isArray(activeTags) ? activeTags : [];
    } catch (error) {
      strapi.log.error('Error checking active trending tags:', error);
      return [];
    }
  }

  /**
   * Perform intensive fetching for trending tags
   * @param {Array} trendingTags - Active trending tags
   */
  async performTrendingFetch(trendingTags) {
    try {
      const videosService = strapi.service('api::videos.videos');
      let totalVideos = 0;

      for (const tag of trendingTags) {
        try {
          // Fetch more videos for trending tags (10 instead of 5)
          const videos = await videosService.fetchVideosByKeyword(tag.tag, {
            maxResults: 10,
            relevanceLanguage: 'en',
            regionCode: 'TH'
          });

          // Save videos to database with trending priority
          for (const video of videos) {
            try {
              await strapi.entityService.create('api::videos.videos', {
                data: {
                  ...video,
                  priority: tag.priority || 5, // Higher priority for trending
                  featured: true, // Mark as featured for trending content
                  publishedAt: new Date().toISOString()
                }
              });
              totalVideos++;
            } catch (saveError) {
              // Skip duplicates or other save errors
              if (!saveError.message.includes('duplicate')) {
                strapi.log.error(`Error saving trending video: ${saveError.message}`);
              }
            }
          }

          strapi.log.info(`Trending fetch completed for tag "${tag.tag}": ${videos.length} videos`);
        } catch (error) {
          strapi.log.error(`Error fetching trending videos for tag "${tag.tag}":`, error);
        }
      }

      // Update scheduler statistics
      await this.updateSchedulerStats('trending_fetch', totalVideos);
      
      return totalVideos;
    } catch (error) {
      strapi.log.error('Error in trending fetch:', error);
      await this.updateSchedulerStats('trending_fetch_error', 1);
      throw error;
    }
  }
}

module.exports = VideoScheduler;
