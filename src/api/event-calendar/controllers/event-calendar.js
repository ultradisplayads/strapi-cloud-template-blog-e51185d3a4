'use strict';

/**
 * event-calendar controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::event-calendar.event-calendar');
