'use strict';

/**
 * google-review service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::google-review.google-review');
