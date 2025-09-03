'use strict';

/**
 * breaking-news custom routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/breaking-news/:id/pin',
      handler: 'breaking-news.pin',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/breaking-news/:id/unpin',
      handler: 'breaking-news.unpin',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/breaking-news/:id/upvote',
      handler: 'breaking-news.upvote',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/breaking-news/:id/downvote',
      handler: 'breaking-news.downvote',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/breaking-news/:id/approve',
      handler: 'breaking-news.approve',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/breaking-news/:id/reject',
      handler: 'breaking-news.reject',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/breaking-news/:id/hide',
      handler: 'breaking-news.hide',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/breaking-news/dashboard',
      handler: 'breaking-news.dashboard',
      config: {
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/breaking-news/live',
      handler: 'breaking-news.live',
      config: {
        auth: false,
        middlewares: [],
      }
    }
  ]
};
