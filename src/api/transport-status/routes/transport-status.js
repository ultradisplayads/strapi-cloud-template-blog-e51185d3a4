'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/transport-status',
      handler: 'transport-status.list',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};


