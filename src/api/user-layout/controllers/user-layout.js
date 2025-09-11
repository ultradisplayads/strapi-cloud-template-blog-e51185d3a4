'use strict';

/**
 * user-layout controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-layout.user-layout', ({ strapi }) => ({
  // Get user's layout
  async getMyLayout(ctx) {
    try {
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('Authentication required');
      }

      const userLayout = await strapi.entityService.findMany('api::user-layout.user-layout', {
        filters: { userId: userId.toString() },
        populate: '*'
      });

      if (userLayout.length === 0) {
        return ctx.body = { layout: null, message: 'No saved layout found' };
      }

      ctx.body = { layout: userLayout[0].layout };
    } catch (error) {
      console.error('Error getting user layout:', error);
      ctx.throw(500, 'Failed to retrieve user layout');
    }
  },

  // Save user's layout
  async saveMyLayout(ctx) {
    try {
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('Authentication required');
      }

      const { layout } = ctx.request.body;

      if (!layout || !Array.isArray(layout)) {
        return ctx.badRequest('Layout data is required and must be an array');
      }

      // Check if user already has a saved layout
      const existingLayout = await strapi.entityService.findMany('api::user-layout.user-layout', {
        filters: { userId: userId.toString() }
      });

      let result;
      if (existingLayout.length > 0) {
        // Update existing layout
        result = await strapi.entityService.update('api::user-layout.user-layout', existingLayout[0].id, {
          data: {
            layout: layout,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new layout
        result = await strapi.entityService.create('api::user-layout.user-layout', {
          data: {
            userId: userId.toString(),
            layout: layout,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      ctx.body = { 
        success: true, 
        data: result,
        message: 'Layout saved successfully' 
      };
    } catch (error) {
      console.error('Error saving user layout:', error);
      ctx.throw(500, 'Failed to save user layout');
    }
  },

  // Delete user's layout
  async deleteMyLayout(ctx) {
    try {
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        return ctx.unauthorized('Authentication required');
      }

      const existingLayout = await strapi.entityService.findMany('api::user-layout.user-layout', {
        filters: { userId: userId.toString() }
      });

      if (existingLayout.length > 0) {
        await strapi.entityService.delete('api::user-layout.user-layout', existingLayout[0].id);
        ctx.body = { success: true, message: 'Layout deleted successfully' };
      } else {
        ctx.body = { success: true, message: 'No layout to delete' };
      }
    } catch (error) {
      console.error('Error deleting user layout:', error);
      ctx.throw(500, 'Failed to delete user layout');
    }
  }
}));
