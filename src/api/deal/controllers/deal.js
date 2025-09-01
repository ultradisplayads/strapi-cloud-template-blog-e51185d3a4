'use strict';

/**
 * deal controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::deal.deal', ({ strapi }) => ({
  // Purchase a deal and create a booking
  async purchase(ctx) {
    try {
      const { id } = ctx.params;
      const { quantity = 1, booking_date_time, special_requests } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      // Get the deal
      const deal = await strapi.entityService.findOne('api::deal.deal', id, {
        populate: ['business']
      });

      if (!deal) {
        return ctx.notFound('Deal not found');
      }

      if (!deal.isActive) {
        return ctx.badRequest('Deal is not active');
      }

      if (deal.quantity_remaining < quantity) {
        return ctx.badRequest('Insufficient quantity available');
      }

      // Check if deal has expired
      if (new Date(deal.expiry_date_time) < new Date()) {
        return ctx.badRequest('Deal has expired');
      }

      // Calculate total amount
      const total_amount = deal.sale_price * quantity;

      // Generate confirmation token
      const confirmation_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Create booking
      const booking = await strapi.entityService.create('api::booking.booking', {
        data: {
          user: user.id,
          deal: deal.id,
          status: 'Pending User Confirmation',
          purchase_date: new Date(),
          booking_date_time: booking_date_time || null,
          quantity,
          total_amount,
          confirmation_token,
          confirmation_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          customer_name: user.username || user.email,
          customer_email: user.email,
          special_requests: special_requests || null
        }
      });

      // Update deal quantity
      await strapi.entityService.update('api::deal.deal', id, {
        data: {
          quantity_remaining: deal.quantity_remaining - quantity
        }
      });

      // TODO: Process payment via Stripe
      // TODO: Send confirmation email to user
      // TODO: Send push notification to user

      return ctx.send({
        message: 'Deal purchased successfully. Please check your email to confirm your booking.',
        booking: {
          id: booking.id,
          confirmation_token: booking.confirmation_token,
          status: booking.status
        }
      });
    } catch (error) {
      return ctx.badRequest('Error purchasing deal', { error: error.message });
    }
  }
}));
