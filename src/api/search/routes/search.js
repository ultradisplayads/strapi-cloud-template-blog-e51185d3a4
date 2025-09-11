module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search/breaking-news',
      handler: 'search.searchBreakingNews',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search/sponsored-posts',
      handler: 'search.searchSponsoredPosts',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search/news-sources',
      handler: 'search.searchNewsSources',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/search/reindex',
      handler: 'search.reindexAll',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
