'use strict';

const STORE = {
  type: 'plugin',
  name: 'transport-hub',
  key: 'traffic-map-url',
};

module.exports = ({ strapi }) => ({
  async getCachedUrl() {
    const store = strapi.store({ type: STORE.type, name: STORE.name });
    const data = await store.get({ key: STORE.key });
    return data?.url || null;
  },

  async refreshStaticMap() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      strapi.log.warn('traffic-map: Missing GOOGLE_MAPS_API_KEY/GOOGLE_PLACES_API_KEY');
    }

    const url = `https://maps.googleapis.com/maps/api/staticmap?center=Pattaya,Thailand&zoom=12&size=1024x512&maptype=roadmap&key=${apiKey || 'FAKE_KEY'}`;

    const store = strapi.store({ type: STORE.type, name: STORE.name });
    await store.set({ key: STORE.key, value: { url, updatedAt: new Date().toISOString() } });
    return url;
  },
});


