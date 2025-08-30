'use strict';

/**
 * photo-gallery service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::photo-gallery.photo-gallery');
