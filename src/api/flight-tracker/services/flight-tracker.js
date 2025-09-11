'use strict';

/**
 * flight-tracker service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::flight-tracker.flight-tracker');
