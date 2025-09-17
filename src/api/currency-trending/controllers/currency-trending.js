'use strict';

/**
 * currency-trending controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::currency-trending.currency-trending', ({ strapi }) => ({
  // Get all trending currencies with THB comparison
  async getTrendingCurrencies(ctx) {
    try {
      const { limit = 50, sort = 'rank:asc' } = ctx.query;

      const currencies = await strapi.entityService.findMany('api::currency-trending.currency-trending', {
        filters: {
          isActive: true
        },
        sort: [sort],
        limit: parseInt(limit),
        populate: []
      });

      // Calculate additional metrics
      const enrichedCurrencies = currencies.map(currency => {
        const changePercent = currency.changePercent24h || 0;
        const trend = changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable';
        
        return {
          ...currency,
          trend,
          displayRate: currency.rateToTHB,
          displayChange: currency.change24h || 0,
          displayChangePercent: changePercent
        };
      });

      return ctx.send({
        data: enrichedCurrencies,
        meta: {
          total: enrichedCurrencies.length,
          lastUpdated: currencies[0]?.lastUpdated || new Date().toISOString()
        }
      });
    } catch (error) {
      return ctx.internalServerError('Failed to fetch trending currencies', { error: error.message });
    }
  },

  // Get specific currency trending data
  async getCurrencyTrend(ctx) {
    try {
      const { currencyCode } = ctx.params;

      const currency = await strapi.entityService.findMany('api::currency-trending.currency-trending', {
        filters: {
          currencyCode: currencyCode,
          isActive: true
        },
        populate: []
      });

      if (currency.length === 0) {
        return ctx.notFound('Currency not found');
      }

      const currencyData = currency[0];
      const changePercent = currencyData.changePercent24h || 0;
      const trend = changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable';

      return ctx.send({
        data: {
          ...currencyData,
          trend,
          displayRate: currencyData.rateToTHB,
          displayChange: currencyData.change24h || 0,
          displayChangePercent: changePercent
        }
      });
    } catch (error) {
      return ctx.internalServerError('Failed to fetch currency trend', { error: error.message });
    }
  },

  // Update currency trending data (used by cron job)
  async updateCurrencyData(ctx) {
    try {
      const { currencyData } = ctx.request.body.data;

      if (!currencyData || !Array.isArray(currencyData)) {
        return ctx.badRequest('Currency data array is required');
      }

      const updatePromises = currencyData.map(async (data) => {
        const existing = await strapi.entityService.findMany('api::currency-trending.currency-trending', {
          filters: {
            currencyCode: data.currencyCode
          }
        });

        const currencyData = {
          currencyCode: data.currencyCode,
          currencyName: data.currencyName,
          currencySymbol: data.currencySymbol,
          currencyFlag: data.currencyFlag,
          rateToTHB: data.rateToTHB,
          previousRateToTHB: existing[0]?.rateToTHB || data.rateToTHB,
          change24h: data.change24h || 0,
          changePercent24h: data.changePercent24h || 0,
          trend: data.trend || 'stable',
          rank: data.rank || 0,
          volume24h: data.volume24h,
          marketCap: data.marketCap,
          lastUpdated: new Date().toISOString(),
          dataSource: data.dataSource || 'exchangerate-api',
          isActive: true
        };

        if (existing.length > 0) {
          return strapi.entityService.update('api::currency-trending.currency-trending', existing[0].id, {
            data: currencyData
          });
        } else {
          return strapi.entityService.create('api::currency-trending.currency-trending', {
            data: currencyData
          });
        }
      });

      const results = await Promise.all(updatePromises);

      return ctx.send({
        message: 'Currency data updated successfully',
        data: results,
        meta: {
          updated: results.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return ctx.internalServerError('Failed to update currency data', { error: error.message });
    }
  }
}));

