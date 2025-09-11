module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/web-search',
      handler: 'web-search.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/web-search/images',
      handler: 'web-search.searchImages',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/web-search/site',
      handler: 'web-search.searchSite',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/web-search/suggestions',
      handler: 'web-search.suggestions',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/web-search/status',
      handler: 'web-search.status',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
