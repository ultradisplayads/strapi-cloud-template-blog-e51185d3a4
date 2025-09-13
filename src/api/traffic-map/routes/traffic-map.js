'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/traffic-map',
      handler: 'traffic-map.getMap',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};


