'use strict';

module.exports = {
  async getMap(ctx) {
    try {
      const svc = strapi.service('api::traffic-map.traffic-map');
      const url = await svc.getCachedUrl();
      if (!url) {
        const fresh = await svc.refreshStaticMap();
        ctx.body = { url: fresh };
        return;
      }
      ctx.body = { url };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to load traffic map' };
    }
  },
};


