'use strict';

/**
 * live-event router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreRouter('api::live-event.live-event');
