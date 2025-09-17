'use strict';

/**
 * currency-favorite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::currency-favorite.currency-favorite', ({ strapi }) => ({
  // Get user's favorite currencies
  async getUserFavorites(ctx) {
    try {
      const { user } = ctx.state;
      
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      const favorites = await strapi.entityService.findMany('api::currency-favorite.currency-favorite', {
        filters: {
          user: user.id,
          isActive: true
        },
        sort: { sortOrder: 'asc', createdAt: 'desc' },
        populate: ['user']
      });

      return ctx.send({
        data: favorites,
        meta: {
          total: favorites.length
        }
      });
    } catch (error) {
      return ctx.internalServerError('Failed to fetch favorites', { error: error.message });
    }
  },

  // Add currency to favorites
  async addToFavorites(ctx) {
    try {
      const { user } = ctx.state;
      const { currencyCode, currencyName, currencySymbol, currencyFlag } = ctx.request.body.data;

      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      if (!currencyCode || !currencyName) {
        return ctx.badRequest('Currency code and name are required');
      }

      // Check if already exists
      const existing = await strapi.entityService.findMany('api::currency-favorite.currency-favorite', {
        filters: {
          user: user.id,
          currencyCode: currencyCode
        }
      });

      if (existing.length > 0) {
        return ctx.badRequest('Currency already in favorites');
      }

      // Get current count for sort order
      const count = await strapi.entityService.count('api::currency-favorite.currency-favorite', {
        filters: {
          user: user.id
        }
      });

      const favorite = await strapi.entityService.create('api::currency-favorite.currency-favorite', {
        data: {
          user: user.id,
          currencyCode,
          currencyName,
          currencySymbol,
          currencyFlag,
          sortOrder: count
        }
      });

      return ctx.send({ data: favorite });
    } catch (error) {
      return ctx.internalServerError('Failed to add to favorites', { error: error.message });
    }
  },

  // Remove currency from favorites
  async removeFromFavorites(ctx) {
    try {
      const { user } = ctx.state;
      const { currencyCode } = ctx.params;

      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      const favorite = await strapi.entityService.findMany('api::currency-favorite.currency-favorite', {
        filters: {
          user: user.id,
          currencyCode: currencyCode
        }
      });

      if (favorite.length === 0) {
        return ctx.notFound('Favorite not found');
      }

      await strapi.entityService.delete('api::currency-favorite.currency-favorite', favorite[0].id);

      return ctx.send({ message: 'Removed from favorites' });
    } catch (error) {
      return ctx.internalServerError('Failed to remove from favorites', { error: error.message });
    }
  },

  // Update sort order of favorites
  async updateSortOrder(ctx) {
    try {
      const { user } = ctx.state;
      const { favorites } = ctx.request.body.data;

      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      if (!Array.isArray(favorites)) {
        return ctx.badRequest('Favorites array is required');
      }

      const updatePromises = favorites.map((fav, index) => 
        strapi.entityService.update('api::currency-favorite.currency-favorite', fav.id, {
          data: {
            sortOrder: index
          }
        })
      );

      await Promise.all(updatePromises);

      return ctx.send({ message: 'Sort order updated' });
    } catch (error) {
      return ctx.internalServerError('Failed to update sort order', { error: error.message });
    }
  }
}));
