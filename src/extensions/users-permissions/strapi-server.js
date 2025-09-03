'use strict';

module.exports = (plugin) => {
  // Add custom routes for FCM token management
  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path: '/users/me/add-fcm-token',
      handler: 'user.addFcmToken',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/users/me/remove-fcm-token',
      handler: 'user.removeFcmToken',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/users/me/fcm-tokens',
      handler: 'user.getFcmTokens',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  );

  // Add custom controller methods
  plugin.controllers.user.addFcmToken = async (ctx) => {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { fcm_token, device_id } = ctx.request.body;
      
      if (!fcm_token) {
        return ctx.badRequest('FCM token is required');
      }

      // Get current user
      const currentUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
      
      // Initialize fcm_tokens if it doesn't exist
      let fcmTokens = currentUser.fcm_tokens || [];
      if (!Array.isArray(fcmTokens)) {
        fcmTokens = [];
      }
      
      // Check if token already exists for this device
      const existingTokenIndex = fcmTokens.findIndex(token => 
        token && typeof token === 'object' && token.device_id === device_id
      );
      
      if (existingTokenIndex !== -1) {
        // Update existing token
        fcmTokens[existingTokenIndex] = {
          fcm_token,
          device_id: device_id || 'unknown',
          added_at: new Date().toISOString()
        };
      } else {
        // Add new token
        fcmTokens.push({
          fcm_token,
          device_id: device_id || 'unknown',
          added_at: new Date().toISOString()
        });
      }

      // Update user with new FCM tokens
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          fcm_tokens: fcmTokens
        }
      });

      return ctx.send({
        message: 'FCM token added successfully',
        fcm_tokens: updatedUser.fcm_tokens
      });
    } catch (error) {
      return ctx.badRequest('Error adding FCM token', { error: error.message });
    }
  };

  plugin.controllers.user.removeFcmToken = async (ctx) => {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { device_id } = ctx.request.body;
      
      if (!device_id) {
        return ctx.badRequest('Device ID is required');
      }

      // Get current user
      const currentUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
      
      let fcmTokens = currentUser.fcm_tokens || [];
      if (!Array.isArray(fcmTokens)) {
        fcmTokens = [];
      }
      
      // Remove token for this device
      fcmTokens = fcmTokens.filter(token => 
        token && typeof token === 'object' && token.device_id !== device_id
      );

      // Update user
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          fcm_tokens: fcmTokens
        }
      });

      return ctx.send({
        message: 'FCM token removed successfully',
        fcm_tokens: updatedUser.fcm_tokens
      });
    } catch (error) {
      return ctx.badRequest('Error removing FCM token', { error: error.message });
    }
  };

  plugin.controllers.user.getFcmTokens = async (ctx) => {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const currentUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
      
      return ctx.send({
        fcm_tokens: currentUser.fcm_tokens || []
      });
    } catch (error) {
      return ctx.badRequest('Error fetching FCM tokens', { error: error.message });
    }
  };

  return plugin;
}; 