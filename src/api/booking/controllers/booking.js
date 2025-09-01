'use strict';

/**
 * booking controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::booking.booking', ({ strapi }) => ({
  // Get user's own bookings
  async me(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: { user: user.id },
        populate: {
          deal: {
            populate: ['image_gallery', 'business']
          }
        },
        sort: { purchase_date: 'desc' }
      });

      return ctx.send(bookings);
    } catch (error) {
      return ctx.badRequest('Error fetching bookings', { error: error.message });
    }
  },

  // Confirm a booking after user clicks confirmation link
  async confirm(ctx) {
    try {
      const { confirmation_token } = ctx.request.body;
      
      if (!confirmation_token) {
        return ctx.badRequest('Confirmation token is required');
      }

      const booking = await strapi.entityService.findMany('api::booking.booking', {
        filters: { confirmation_token, status: 'Pending User Confirmation' },
        populate: ['deal', 'deal.business', 'user']
      });

      if (!booking || booking.length === 0) {
        return ctx.badRequest('Invalid or expired confirmation token');
      }

      const bookingRecord = booking[0];

      // Generate confirmation code and QR code
      const confirmation_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const qr_code_data = JSON.stringify({
        booking_id: bookingRecord.id,
        confirmation_code,
        deal_title: bookingRecord.deal.deal_title,
        business_name: bookingRecord.deal.business.name
      });

      // Update booking status
      const updatedBooking = await strapi.entityService.update('api::booking.booking', bookingRecord.id, {
        data: {
          status: 'Confirmed',
          confirmation_code,
          qr_code_data
        }
      });

      // TODO: Send notifications to venue and user
      // This will be implemented with the notification service

      return ctx.send({
        message: 'Booking confirmed successfully',
        booking: updatedBooking
      });
    } catch (error) {
      return ctx.badRequest('Error confirming booking', { error: error.message });
    }
  },

  // Generate calendar event file
  async calendarEvent(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const booking = await strapi.entityService.findOne('api::booking.booking', id, {
        populate: ['deal', 'deal.business']
      });

      if (!booking || booking.user.id !== user.id) {
        return ctx.notFound('Booking not found');
      }

      // Generate ICS file content
      const icsContent = generateICSFile(booking);

      ctx.set('Content-Type', 'text/calendar');
      ctx.set('Content-Disposition', `attachment; filename="booking-${id}.ics"`);
      return ctx.send(icsContent);
    } catch (error) {
      return ctx.badRequest('Error generating calendar event', { error: error.message });
    }
  },

  // Venue redemption endpoint
  async redeem(ctx) {
    try {
      const { confirmation_code } = ctx.request.body;
      
      if (!confirmation_code) {
        return ctx.badRequest('Confirmation code is required');
      }

      const booking = await strapi.entityService.findMany('api::booking.booking', {
        filters: { confirmation_code, status: 'Confirmed' },
        populate: ['deal', 'deal.business', 'user']
      });

      if (!booking || booking.length === 0) {
        return ctx.badRequest('Invalid confirmation code or booking already redeemed');
      }

      const bookingRecord = booking[0];

      // Update booking status to redeemed
      const updatedBooking = await strapi.entityService.update('api::booking.booking', bookingRecord.id, {
        data: {
          status: 'Redeemed'
        }
      });

      // TODO: Send confirmation to user
      // This will be implemented with the notification service

      return ctx.send({
        message: 'Booking redeemed successfully',
        booking: updatedBooking
      });
    } catch (error) {
      return ctx.badRequest('Error redeeming booking', { error: error.message });
    }
  }
}));

// Helper function to generate ICS file content
function generateICSFile(booking) {
  const startDate = new Date(booking.booking_date_time || booking.purchase_date);
  const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pattaya1//Hot Deals//EN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@pattaya1.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${booking.deal.deal_title}`,
    `DESCRIPTION:Booking confirmation code: ${booking.confirmation_code}`,
    `LOCATION:${booking.deal.business.name}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
