'use strict';

/**
 * admin-widget-configs router
 */

const customRoutes = [
  {
    method: 'GET',
    path: '/admin/widget-configs',
    handler: 'admin-widget-configs.getConfigs',
    config: {
      middlewares: ['api::admin-widget-configs.auth'],
    }
  },
  {
    method: 'PUT',
    path: '/admin/widget-configs',
    handler: 'admin-widget-configs.updateConfigs',
    config: {
      middlewares: ['api::admin-widget-configs.auth'],
    }
  },
  {
    method: 'GET',
    path: '/admin/widget-configs/:widgetId',
    handler: 'admin-widget-configs.getWidgetConfig',
    config: {
      middlewares: [],
    }
  },
  {
    method: 'PUT',
    path: '/admin/widget-configs/:widgetId',
    handler: 'admin-widget-configs.updateWidgetConfig',
    config: {
      middlewares: ['api::admin-widget-configs.auth'],
    }
  }
];

module.exports = {
  routes: customRoutes
};
