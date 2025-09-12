'use strict';

/**
 * forum-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore - Custom content type not recognized by TypeScript
module.exports = createCoreController('api::forum-category.forum-category');
