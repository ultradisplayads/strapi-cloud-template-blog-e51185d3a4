const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::travel-widget.travel-widget', ({ strapi }) => ({
  // Get Skyscanner flight search URL (back to Skyscanner for flights)
  async flightSearch(ctx) {
    try {
      const { 
        origin, 
        destination, 
        departureDate, 
        returnDate, 
        adults = 1, 
        children = 0, 
        infants = 0,
        cabinClass = 'economy',
        currency = 'THB',
        locale = 'en-US'
      } = ctx.query;

      if (!origin || !destination || !departureDate) {
        return ctx.badRequest('Origin, destination, and departure date are required');
      }

      // Get widget configuration
      const widgets = await strapi.entityService.findMany('api::travel-widget.travel-widget', {
        filters: { IsActive: true },
        limit: 1
      });

      const config = widgets[0]?.TrivagoConfig || {
        AffiliateId: '458224',
        DefaultCurrency: 'THB'
      };

      // Build Skyscanner URL with Trivago affiliate tracking
      const baseUrl = 'https://www.skyscanner.com/transport/flights';
      
      // Format dates properly (YYMMDD format)
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
      };

      const formattedDepartureDate = formatDate(departureDate);
      const formattedReturnDate = returnDate ? formatDate(returnDate) : null;
      
      // Build URL path with proper format
      let searchUrl = `${baseUrl}/${origin}/${destination}/${formattedDepartureDate}`;
      if (formattedReturnDate) {
        searchUrl += `/${formattedReturnDate}`;
      }

      // Add query parameters
      const params = new URLSearchParams({
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
        cabinclass: cabinClass.toString(),
        currency: currency.toString(),
        locale: locale.toString(),
        ref: config.AffiliateId || '458224'
      });

      const finalUrl = `${searchUrl}?${params.toString()}`;

      const tripType = returnDate ? 'return' : 'oneway';
      
      ctx.body = {
        success: true,
        data: {
          searchUrl: finalUrl,
          searchParams: {
            origin,
            destination,
            departureDate,
            returnDate,
            passengers: { adults, children, infants },
            cabinClass,
            currency,
            locale
          }
        },
        meta: {
          provider: 'Skyscanner',
          tripType,
          affiliateId: config.AffiliateId || '458224',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      strapi.log.error('Flight search error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Get Trivago hotel search URL
  async hotelSearch(ctx) {
    try {
      const {
        destination,
        checkinDate,
        checkoutDate,
        adults = 2,
        children = 0,
        rooms = 1,
        currency = 'INR',
        locationId = null
      } = ctx.query;

      if (!destination || !checkinDate || !checkoutDate) {
        return ctx.badRequest('Destination, check-in date, and check-out date are required');
      }

      // Get widget configuration
      const widgets = await strapi.entityService.findMany('api::travel-widget.travel-widget', {
        filters: { IsActive: true },
        limit: 1
      });

      const config = widgets[0]?.TrivagoConfig || {
        AffiliateId: '458224',
        DefaultCurrency: 'INR'
      };

      // Format dates for Trivago (YYYYMMDD format)
      const formatDateForTrivago = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
      };

      const formattedCheckinDate = formatDateForTrivago(checkinDate);
      const formattedCheckoutDate = formatDateForTrivago(checkoutDate);

      // Build Trivago search URL with proper format matching the provided example
      // Format: https://www.trivago.in/en-IN/lm/hotels-{destination}-india?search={locationId};dr-{checkin}-{checkout}-s
      const destination_clean = String(destination).trim().toLowerCase().replace(/\s+/g, '-');
      
      if (!locationId) {
        return ctx.badRequest('Location ID is required for hotel search');
      }
      
      // Use the exact format from the provided URL
      const searchParam = `${locationId};dr-${formattedCheckinDate}-${formattedCheckoutDate}-s`;
      let searchUrl = `https://www.trivago.in/en-IN/lm/hotels-${destination_clean}-india?search=${searchParam}`;

      // Add affiliate tracking if available
      if (config.AffiliateId && config.AffiliateId !== '458224') {
        const separator = searchUrl.includes('?') ? '&' : '?';
        searchUrl += `${separator}aff=${config.AffiliateId}`;
      }

      ctx.body = {
        success: true,
        data: {
          searchUrl: searchUrl,
          scriptUrl: config.ScriptUrl || 'https://emrldco.com/NDU4MjI0.js?t=458224',
          searchParams: {
            destination,
            checkinDate,
            checkoutDate,
            formattedCheckinDate,
            formattedCheckoutDate,
            guests: { adults, children, rooms },
            currency,
            locationId
          }
        },
        meta: {
          provider: 'Trivago',
          affiliateId: config.AffiliateId || '458224',
          urlFormat: locationId ? 'location-based' : 'search-based',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      strapi.log.error('Hotel search error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Get popular destinations
  async destinations(ctx) {
    try {
      const widgets = await strapi.entityService.findMany('api::travel-widget.travel-widget', {
        filters: { IsActive: true },
        limit: 1
      });

      const destinations = widgets[0]?.PopularDestinations || [
        {"name": "Bangkok", "code": "BKK", "country": "Thailand"},
        {"name": "Pattaya", "code": "UTP", "country": "Thailand"},
        {"name": "Phuket", "code": "HKT", "country": "Thailand"},
        {"name": "Chiang Mai", "code": "CNX", "country": "Thailand"}
      ];

      ctx.body = {
        success: true,
        data: destinations,
        meta: {
          count: destinations.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      strapi.log.error('Destinations error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Get widget configuration
  async config(ctx) {
    try {
      const widgets = await strapi.entityService.findMany('api::travel-widget.travel-widget', {
        filters: { IsActive: true },
        populate: '*',
        limit: 1
      });

      if (!widgets || widgets.length === 0) {
        return ctx.notFound('No active travel widget found');
      }

      const widget = widgets[0];

      ctx.body = {
        success: true,
        data: {
          title: widget.Title,
          description: widget.Description,
          widgetType: widget.WidgetType,
          defaultOrigin: widget.DefaultOrigin,
          defaultDestination: widget.DefaultDestination,
          popularDestinations: widget.PopularDestinations,
          skyscannerConfig: widget.SkyscannerConfig,
          trivagoConfig: widget.TrivagoConfig,
          styling: widget.Styling,
          analytics: widget.Analytics
        },
        meta: {
          widgetId: widget.id,
          lastModified: widget.LastModified,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      strapi.log.error('Widget config error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Track analytics
  async trackEvent(ctx) {
    try {
      const { eventType, provider, searchParams } = ctx.request.body;

      if (!eventType || !provider) {
        return ctx.badRequest('Event type and provider are required');
      }

      // Log analytics event
      strapi.log.info(`Travel Widget Analytics: ${eventType} - ${provider}`, {
        searchParams,
        timestamp: new Date().toISOString(),
        userAgent: ctx.request.headers['user-agent'],
        ip: ctx.request.ip
      });

      ctx.body = {
        success: true,
        data: {
          eventTracked: true,
          eventType,
          provider
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      strapi.log.error('Analytics tracking error:', error);
      ctx.body = {
        success: false,
        error: error.message,
        data: { eventTracked: false }
      };
    }
  }
}));
