'use strict';

/**
 * event-calendar router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreRouter('api::event-calendar.event-calendar');
