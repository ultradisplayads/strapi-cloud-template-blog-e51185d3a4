'use strict';

/**
 * event-calendar service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::event-calendar.event-calendar');
