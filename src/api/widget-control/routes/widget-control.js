'use strict';

/**
 * widget-control router
 */

const customRoutes = [
  {
    method: 'GET',
    path: '/widget-control/config',
    handler: 'widget-control.getConfig',
    config: {
      middlewares: [],
    }
  },
  {
    method: 'PUT',
    path: '/widget-control/config',
    handler: 'widget-control.updateConfig',
    config: {
      middlewares: [],
    }
  }
];

module.exports = {
  routes: customRoutes
};
