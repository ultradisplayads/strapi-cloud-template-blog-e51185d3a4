'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Public routes - specific routes first to avoid conflicts
    {
      method: 'GET',
      path: '/photos/latest',
      handler: 'photo.getLatest',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/photos/trending',
      handler: 'photo.getTrending',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/photos',
      handler: 'photo.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/photos/:id',
      handler: 'photo.findOne',
      config: {
        auth: false,
      },
    },
    // Public routes for photo creation
    {
      method: 'POST',
      path: '/photos',
      handler: 'photo.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/photos/:id/like',
      handler: 'photo.like',
      config: {
        auth: {
          scope: ['find']
        },
      },
    },
    // Admin routes
    {
      method: 'GET',
      path: '/photos/pending',
      handler: 'photo.getPending',
      config: {
        auth: {
          scope: ['find']
        },
      },
    },
    {
      method: 'POST',
      path: '/photos/:id/approve',
      handler: 'photo.approve',
      config: {
        auth: {
          scope: ['find']
        },
      },
    },
    {
      method: 'POST',
      path: '/photos/:id/reject',
      handler: 'photo.reject',
      config: {
        auth: {
          scope: ['find']
        },
      },
    },
    {
      method: 'GET',
      path: '/photos/:id/debug',
      handler: 'photo.debugPhoto',
      config: {
        auth: false,
      },
    },
  ],
};
