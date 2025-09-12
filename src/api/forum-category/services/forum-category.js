'use strict';

/**
 * forum-category service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore - Custom content type not recognized by TypeScript
module.exports = createCoreService('api::forum-category.forum-category');
