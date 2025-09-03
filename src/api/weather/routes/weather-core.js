'use strict';

/**
 * Core weather router configuration - disables default routes
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::weather.weather', {
  only: [], // Disable all core routes
  except: ['find', 'findOne', 'create', 'update', 'delete'] // Explicitly exclude all
}); 