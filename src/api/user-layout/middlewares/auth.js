'use strict';

/**
 * Authentication middleware for user-layout routes
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // Check if user is authenticated
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      // Add user ID to context for use in controllers
      ctx.state.userId = ctx.state.user.id;
      
      await next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return ctx.unauthorized('Authentication failed');
    }
  };
};
