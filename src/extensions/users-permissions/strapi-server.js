'use strict';

module.exports = (plugin) => {
  // Store the original authenticate function
  const originalAuthenticate = plugin.controllers.auth.callback;

  // Override the callback method to handle Firebase tokens
  plugin.controllers.auth.callback = async (ctx) => {
    try {
      // Try the original Strapi authentication first
      return await originalAuthenticate(ctx);
    } catch (error) {
      // If Strapi auth fails, try Firebase authentication
      const token = ctx.request.header.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return ctx.badRequest('No token provided');
      }

      try {
        // Verify Firebase token
        const decodedToken = await strapi.firebase.auth().verifyIdToken(token);
        
        if (decodedToken && decodedToken.uid) {
          // Find user by Firebase UID
          const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { firebaseUid: decodedToken.uid },
            populate: { role: true },
          });
          
          if (users && users.length > 0 && !users[0].blocked) {
            const user = users[0];
            
            // Set user in context
            ctx.state.user = user;
            
            // Return user data like Strapi does
            ctx.send({
              jwt: token, // Use Firebase token as JWT
              user: await strapi.plugins['users-permissions'].services.user.sanitizeUser(user),
            });
            return;
          } else {
            return ctx.badRequest('User not found or blocked');
          }
        }
      } catch (firebaseError) {
        console.error('Firebase token verification failed:', firebaseError);
        return ctx.badRequest('Invalid Firebase token');
      }
      
      // If both authentications fail, return the original error
      throw error;
    }
  };

  // Add custom routes for Firebase auth
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/firebase/register',
    handler: 'firebase.register',
    config: {
      middlewares: ['plugin::users-permissions.rateLimit'],
      prefix: '',
      policies: [],
    },
  });

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/firebase/login',
    handler: 'firebase.login',
    config: {
      middlewares: ['plugin::users-permissions.rateLimit'],
      prefix: '',
      policies: [],
    },
  });

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/firebase/forgot-password',
    handler: 'firebase.forgotPassword',
    config: {
      middlewares: ['plugin::users-permissions.rateLimit'],
      prefix: '',
      policies: [],
    },
  });

  // Add Firebase controller
  plugin.controllers.firebase = require('./controllers/firebase');

  return plugin;
}; 