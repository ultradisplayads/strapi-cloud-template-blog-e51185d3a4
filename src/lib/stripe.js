'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

module.exports = stripe;
