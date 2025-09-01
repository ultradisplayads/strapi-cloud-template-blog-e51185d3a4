'use strict';

module.exports = {
  routes: [
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
    }
  ]
};
