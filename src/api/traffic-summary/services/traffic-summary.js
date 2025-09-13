'use strict';

function minutesFromSeconds(seconds) {
  return Math.round(seconds / 60);
}

function statusFromDelay(delayMinutes) {
  if (delayMinutes <= 0) return 'clear';
  if (delayMinutes <= 20) return 'moderate';
  return 'heavy';
}

module.exports = {
  /**
   * Poll Directions API for each active traffic-route and update fields.
   */
  async updateSummary() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      strapi.log.warn('traffic-summary: Missing GOOGLE_MAPS_API_KEY/GOOGLE_PLACES_API_KEY');
    }

    // Dynamic import for node-fetch ES module
    const { default: fetch } = await import('node-fetch');

    const routes = await strapi.entityService.findMany('api::traffic-route.traffic-route', {
      filters: { IsActive: { $eq: true } },
      sort: { Order: 'asc' },
    });

    for (const r of routes) {
      try {
        // Expect Description to optionally store origin/destination addresses; fallback to From/To
        const origin = r.From;
        const destination = r.To;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&departure_time=now&key=${apiKey || 'FAKE'}`;
        const resp = await fetch(url);
        const json = await resp.json();
        const leg = json?.routes?.[0]?.legs?.[0];
        if (!leg) continue;

        const typical = r.NormalTime; // string e.g., "1h 30m"; keep as-is
        const liveSeconds = leg.duration_in_traffic?.value || leg.duration?.value;
        const liveMinutes = minutesFromSeconds(liveSeconds || 0);
        const liveStr = `${liveMinutes}m`;
        const typicalMinutes = /([0-9]+)h\s*([0-9]+)m/.test(typical)
          ? (parseInt(RegExp.$1, 10) * 60 + parseInt(RegExp.$2, 10))
          : (/([0-9]+)m/.test(typical) ? parseInt(RegExp.$1, 10) : liveMinutes);
        const delay = liveMinutes - typicalMinutes;
        const status = statusFromDelay(delay);

        await strapi.entityService.update('api::traffic-route.traffic-route', r.id, {
          data: {
            CurrentTime: liveStr,
            Delay: delay,
            Status: status,
            LastUpdated: new Date().toISOString(),
          },
        });
      } catch (e) {
        strapi.log.warn(`traffic-summary: failed for route ${r.id}: ${e.message}`);
      }
    }

    // TODO: merge approved road reports and major events if needed
    return { updated: routes.length };
  },
};


