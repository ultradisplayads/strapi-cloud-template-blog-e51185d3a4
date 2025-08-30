'use strict';

/**
 * live-event service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::live-event.live-event');
