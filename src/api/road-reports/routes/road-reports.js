'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/road-reports/submit',
      handler: 'road-reports.submit',
      config: {
        auth: {},
        policies: ['global::ensure-auth'],
      },
    },
  ],
};


