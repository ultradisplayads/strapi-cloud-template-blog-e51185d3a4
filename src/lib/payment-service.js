'use strict';

const stripe = require('./stripe');

class PaymentService {
  /**
   * Create a payment intent for a deal purchase
   */
  async createPaymentIntent(amount, currency = 'thb', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Process a successful payment
   */
  async processSuccessfulPayment(paymentIntentId, bookingId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update booking status to paid
        await strapi.entityService.update('api::booking.booking', bookingId, {
          data: {
            payment_status: 'paid',
            stripe_payment_intent_id: paymentIntentId,
            paid_at: new Date()
          }
        });

        return {
          success: true,
          payment_intent: paymentIntent,
          message: 'Payment processed successfully'
        };
      } else {
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, webhookSecret) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSucceeded(event.data.object);
        
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
        
        case 'charge.refunded':
          return await this.handleRefundProcessed(event.data.object);
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { handled: false, type: event.type };
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSucceeded(paymentIntent) {
    try {
      const { booking_id } = paymentIntent.metadata;
      
      if (booking_id) {
        await this.processSuccessfulPayment(paymentIntent.id, booking_id);
        
        // TODO: Send confirmation email to user
        // TODO: Send notification to venue
        
        return {
          handled: true,
          type: 'payment_intent.succeeded',
          booking_id: booking_id
        };
      }
      
      return { handled: false, type: 'payment_intent.succeeded', reason: 'No booking_id in metadata' };
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailed(paymentIntent) {
    try {
      const { booking_id } = paymentIntent.metadata;
      
      if (booking_id) {
        // Update booking status to payment failed
        await strapi.entityService.update('api::booking.booking', booking_id, {
          data: {
            payment_status: 'failed',
            stripe_payment_intent_id: paymentIntent.id
          }
        });

        // TODO: Send failure notification to user
        // TODO: Send notification to venue
        
        return {
          handled: true,
          type: 'payment_intent.payment_failed',
          booking_id: booking_id
        };
      }
      
      return { handled: false, type: 'payment_intent.payment_failed', reason: 'No booking_id in metadata' };
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  /**
   * Handle refund processed webhook
   */
  async handleRefundProcessed(charge) {
    try {
      const { booking_id } = charge.metadata;
      
      if (booking_id) {
        // Update booking status to refunded
        await strapi.entityService.update('api::booking.booking', booking_id, {
          data: {
            payment_status: 'refunded',
            refunded_at: new Date()
          }
        });

        // TODO: Send refund notification to user
        // TODO: Send notification to venue
        
        return {
          handled: true,
          type: 'charge.refunded',
          booking_id: booking_id
        };
      }
      
      return { handled: false, type: 'charge.refunded', reason: 'No booking_id in metadata' };
    } catch (error) {
      console.error('Error handling refund processed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
