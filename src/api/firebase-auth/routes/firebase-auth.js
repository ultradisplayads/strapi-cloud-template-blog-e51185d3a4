'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/firebase-auth/register',
      handler: 'firebase-auth.register',
      config: {
        prefix: '',
        auth: false, // Make this route public
      },
    },
    {
      method: 'POST',
      path: '/firebase-auth/login',
      handler: 'firebase-auth.login',
      config: {
        prefix: '',
        auth: false, // Make this route public
      },
    },
    {
      method: 'POST',
      path: '/firebase-auth/forgot-password',
      handler: 'firebase-auth.forgotPassword',
      config: {
        prefix: '',
        auth: false, // Make this route public
      },
    },
  ],
}; 