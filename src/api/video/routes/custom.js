'use strict';

/**
 * Custom routes for videos API - test endpoints
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/featured-videos/test-fetch',
      handler: 'video.testFetch',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/featured-videos/test-keywords',
      handler: 'video.testKeywords',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/featured-videos/test-save',
      handler: 'video.testSave',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/featured-videos/test-status',
      handler: 'video.testStatus',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/featured-videos/scheduler-status',
      handler: 'video.schedulerStatus',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/featured-videos/scheduler-trigger',
      handler: 'video.schedulerTrigger',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/featured-videos/test-hybrid-approval',
      handler: 'video.testHybridApproval',
      config: {
        auth: false,
      },
    },
    
    // ========== PHASE 4: MODERATION & WORKFLOW ROUTES ==========
    
    {
      method: 'GET',
      path: '/featured-videos/moderation/pending',
      handler: 'video.getModerationPending',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'PUT',
      path: '/featured-videos/moderation/update/:id',
      handler: 'video.updateVideoStatus',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'PUT',
      path: '/featured-videos/moderation/bulk-status',
      handler: 'video.bulkUpdateVideoStatus',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'GET',
      path: '/featured-videos/moderation/stats',
      handler: 'video.getModerationStats',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'GET',
      path: '/featured-videos/approved',
      handler: 'video.getApprovedVideos',
      config: {
        auth: false, // Public endpoint for frontend
      },
    },
    
    // ========== PHASE 5: FRONTEND WIDGET API ==========
    
    {
      method: 'GET',
      path: '/videos/display-set',
      handler: 'video.getDisplaySet',
      config: {
        auth: false, // Public endpoint for frontend widget
      },
    },
    
    // ========== PHASE 6: MONETIZATION LAYER ==========
    
    {
      method: 'PUT',
      path: '/videos/promote/:id',
      handler: 'video.promoteVideo',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'DELETE',
      path: '/videos/promote/:id',
      handler: 'video.removePromotion',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'GET',
      path: '/videos/monetization/stats',
      handler: 'video.getMonetizationStats',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
    {
      method: 'GET',
      path: '/videos/promoted',
      handler: 'video.getPromotedVideos',
      config: {
        auth: false, // Set to true in production for admin-only access
      },
    },
  ],
};
