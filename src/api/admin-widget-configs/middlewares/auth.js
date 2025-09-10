'use strict';

/**
 * Authentication middleware for admin-widget-configs routes
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // Check if user is authenticated
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      // Check if user is admin
      const user = ctx.state.user;
      if (user.role?.type !== 'administrator') {
        return ctx.forbidden('Admin access required');
      }
      
      await next();
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return ctx.unauthorized('Authentication failed');
    }
  };
};
