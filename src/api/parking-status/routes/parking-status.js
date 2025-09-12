'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/parking-status',
      handler: 'parking-status.list',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};


