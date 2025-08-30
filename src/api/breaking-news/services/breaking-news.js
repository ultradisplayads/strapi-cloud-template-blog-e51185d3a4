'use strict';

/**
 * breaking-news service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::breaking-news.breaking-news');
