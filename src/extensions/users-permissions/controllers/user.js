'use strict';

module.exports = {
  // Add FCM token to user
  async addFcmToken(ctx) {
    try {
      const { fcm_token } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      if (!fcm_token) {
        return ctx.badRequest('FCM token is required');
      }

      // Get current FCM tokens
      const currentTokens = user.fcm_tokens || [];
      
      // Add new token if not already present
      if (!currentTokens.includes(fcm_token)) {
        currentTokens.push(fcm_token);
      }

      // Update user with new FCM tokens
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          fcm_tokens: currentTokens
        }
      });

      return ctx.send({
        message: 'FCM token added successfully',
        fcm_tokens: updatedUser.fcm_tokens
      });
    } catch (error) {
      return ctx.badRequest('Error adding FCM token', { error: error.message });
    }
  },

  // Remove FCM token from user
  async removeFcmToken(ctx) {
    try {
      const { fcm_token } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      if (!fcm_token) {
        return ctx.badRequest('FCM token is required');
      }

      // Get current FCM tokens
      const currentTokens = user.fcm_tokens || [];
      
      // Remove the specified token
      const updatedTokens = currentTokens.filter(token => token !== fcm_token);

      // Update user with updated FCM tokens
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          fcm_tokens: updatedTokens
        }
      });

      return ctx.send({
        message: 'FCM token removed successfully',
        fcm_tokens: updatedUser.fcm_tokens
      });
    } catch (error) {
      return ctx.badRequest('Error removing FCM token', { error: error.message });
    }
  }
};
