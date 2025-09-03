'use strict';

/**
 * weather-activity-suggestion service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::weather-activity-suggestion.weather-activity-suggestion');
