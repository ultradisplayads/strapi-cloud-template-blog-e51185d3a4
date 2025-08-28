'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/test/protected',
      handler: 'test.protected',
      config: {
        middlewares: ['global::firebase-auth'],
        prefix: '',
      },
    },
    {
      method: 'GET',
      path: '/test/public',
      handler: 'test.public',
      config: {
        prefix: '',
      },
    },
    {
      method: 'GET',
      path: '/test/status',
      handler: 'test.status',
      config: {
        prefix: '',
      },
    },
    {
      method: 'GET',
      path: '/test/auth',
      handler: 'test.testAuth',
      config: {
        middlewares: ['global::firebase-auth'],
        prefix: '',
      },
    },
  ],
}; 