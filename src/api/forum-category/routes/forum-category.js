'use strict';

/**
 * forum-category router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// @ts-ignore - Custom content type not recognized by TypeScript
module.exports = createCoreRouter('api::forum-category.forum-category');
