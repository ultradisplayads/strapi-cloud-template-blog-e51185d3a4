'use strict';

/**
 * deal controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const paymentService = require('../../../lib/payment-service');

module.exports = createCoreController('api::deal.deal', ({ strapi }) => ({
  // List all active deals with filtering capabilities
  async list(ctx) {
    try {
      const { 
        category, 
        business, 
        minPrice, 
        maxPrice, 
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = ctx.query;

      // Build filters
      const filters = {
        isActive: true,
        expiry_date_time: {
          $gt: new Date()
        }
      };

      if (category && typeof category === 'string') filters.category = category;
      if (business && typeof business === 'string') filters.business = business;
      if (minPrice && typeof minPrice === 'string' && !isNaN(parseFloat(minPrice))) filters.sale_price = { $gte: parseFloat(minPrice) };
      if (maxPrice && typeof maxPrice === 'string' && !isNaN(parseFloat(maxPrice))) {
        if (filters.sale_price) {
          filters.sale_price.$lte = parseFloat(maxPrice);
        } else {
          filters.sale_price = { $lte: parseFloat(maxPrice) };
        }
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';

      const deals = await strapi.entityService.findMany('api::deal.deal', {
        filters,
        populate: {
          business: true,
          image_gallery: true,
          category: true
        },
        sort
      });

      return ctx.send(deals);
    } catch (error) {
      return ctx.badRequest('Error fetching deals', { error: error.message });
    }
  },

  // Get single deal details
  /*
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      console.log('Looking for deal with ID:', id);
      
      const deal = await strapi.entityService.findOne('api::deal.deal', id);
      console.log('Found deal:', deal);
      
      if (!deal) {
        return ctx.notFound('Deal not found');
      }

      // Check if deal is active and not expired
      if (!deal.isActive || (deal.expiry_date_time && new Date(deal.expiry_date_time) < new Date())) {
        return ctx.badRequest('Deal is not available');
      }

      return ctx.send(deal);
    } catch (error) {
      console.error('Error in findOne:', error);
      return ctx.badRequest('Error fetching deal', { error: error.message });
    }
  },
  */

  // Purchase a deal and create a booking
  async purchase(ctx) {
    try {
      const { id } = ctx.params;
      const { quantity = 1, booking_date_time, special_requests, payment_method_id } = ctx.request.body;
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

      // Create booking first (with pending payment status)
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

      // Create Stripe payment intent
      const paymentIntent = await paymentService.createPaymentIntent(total_amount, 'thb', {
        booking_id: booking.id,
        deal_id: deal.id,
        user_id: user.id,
        quantity: quantity
      });

      // Update booking with payment intent ID
      await strapi.entityService.update('api::booking.booking', booking.id, {
        data: {
          stripe_payment_intent_id: paymentIntent.id
        }
      });

      // Update deal quantity
      await strapi.entityService.update('api::deal.deal', id, {
        data: {
          quantity_remaining: deal.quantity_remaining - quantity
        }
      });

      // TODO: Send confirmation email to user
      // TODO: Send push notification to user

      return ctx.send({
        message: 'Deal purchased successfully. Please complete payment to confirm your booking.',
        booking: {
          id: booking.id,
          confirmation_token: booking.confirmation_token,
          status: booking.status
        },
        payment: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount: total_amount,
          currency: 'thb'
        }
      });
    } catch (error) {
      return ctx.badRequest('Error purchasing deal', { error: error.message });
    }
  },

  // Confirm payment after Stripe payment is completed
  async confirmPayment(ctx) {
    try {
      const { id } = ctx.params;
      const { payment_intent_id } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      if (!payment_intent_id) {
        return ctx.badRequest('Payment intent ID is required');
      }

      // Get the deal
      const deal = await strapi.entityService.findOne('api::deal.deal', id, {
        populate: ['business']
      });

      if (!deal) {
        return ctx.notFound('Deal not found');
      }

      // Find the booking for this deal and user
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          deal: id,
          user: user.id,
          stripe_payment_intent_id: payment_intent_id
        }
      });

      if (!bookings || bookings.length === 0) {
        return ctx.notFound('Booking not found for this payment');
      }

      const booking = bookings[0];

      // Confirm the payment with Stripe
      const paymentIntent = await paymentService.confirmPaymentIntent(payment_intent_id);

      if (paymentIntent.status === 'succeeded') {
        // Update booking status to confirmed
        await strapi.entityService.update('api::booking.booking', booking.id, {
          data: {
            status: 'Confirmed',
            payment_status: 'paid',
            paid_at: new Date()
          }
        });

        // TODO: Send confirmation email to user
        // TODO: Send notification to venue
        // TODO: Send push notification to user

        return ctx.send({
          message: 'Payment confirmed successfully. Your booking is now confirmed!',
          booking: {
            id: booking.id,
            status: 'Confirmed',
            payment_status: 'paid'
          }
        });
      } else {
        return ctx.badRequest(`Payment not successful. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      return ctx.badRequest('Error confirming payment', { error: error.message });
    }
  },

  // Handle Stripe webhook events
  async handleWebhook(ctx) {
    try {
      const signature = ctx.request.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!signature || !webhookSecret) {
        return ctx.badRequest('Missing webhook signature or secret');
      }

      // Get the raw body for webhook verification
      const payload = ctx.request.body[Symbol.for('unparsedBody')] || JSON.stringify(ctx.request.body);
      
      // Verify webhook signature
      const event = paymentService.verifyWebhookSignature(payload, signature, webhookSecret);

      // Handle the webhook event
      const result = await paymentService.handleWebhookEvent(event);

      return ctx.send({
        message: 'Webhook processed successfully',
        result
      });
    } catch (error) {
      console.error('Webhook error:', error);
      return ctx.badRequest('Webhook processing failed', { error: error.message });
    }
  },

  // Test endpoint to verify Stripe connection
  async testPayment(ctx) {
    try {
      const { amount = 100, currency = 'thb' } = ctx.request.body;

      // Create a test payment intent
      const paymentIntent = await paymentService.createPaymentIntent(amount, currency, {
        test: true,
        description: 'Test payment for Stripe integration'
      });

      return ctx.send({
        message: 'Stripe connection successful',
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      });
    } catch (error) {
      return ctx.badRequest('Stripe test failed', { error: error.message });
    }
  }
}));
