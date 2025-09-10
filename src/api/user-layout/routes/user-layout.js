'use strict';

/**
 * user-layout router
 */

const customRoutes = [
  {
    method: 'GET',
    path: '/users/me/layout',
    handler: 'user-layout.getMyLayout',
    config: {
      middlewares: ['api::user-layout.auth'],
    }
  },
  {
    method: 'POST',
    path: '/users/me/layout',
    handler: 'user-layout.saveMyLayout',
    config: {
      middlewares: ['api::user-layout.auth'],
    }
  },
  {
    method: 'DELETE',
    path: '/users/me/layout',
    handler: 'user-layout.deleteMyLayout',
    config: {
      middlewares: ['api::user-layout.auth'],
    }
  }
];

module.exports = {
  routes: customRoutes
};
