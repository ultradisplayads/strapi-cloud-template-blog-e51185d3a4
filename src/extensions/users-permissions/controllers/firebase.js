'use strict';

const axios = require('axios');

module.exports = {
  async register(ctx) {
    const { email, password, username } = ctx.request.body;

    if (!email || !password || !username) {
      return ctx.badRequest('Email, password, and username are required');
    }

    try {
      // Create user in Firebase
      const firebaseResponse = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_WEB_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );

      const { localId: firebaseUid, idToken } = firebaseResponse.data;

      // Get default role
      const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (!defaultRole) {
        return ctx.badRequest('Default role not found');
      }

      // Check if user already exists in Strapi
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email },
      });

      if (existingUser) {
        return ctx.badRequest('User with this email already exists in Strapi');
      }

      // Create user in Strapi
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username,
          email,
          firebaseUid,
          confirmed: true,
          role: defaultRole.id,
          provider: 'firebase',
        },
      });

      // Sanitize user data
      const sanitizedUser = await strapi.plugins['users-permissions'].services.user.sanitizeUser(user);

      ctx.send({
        jwt: idToken,
        user: sanitizedUser,
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      if (error.response?.data?.error?.message === 'EMAIL_EXISTS') {
        return ctx.badRequest('Email already exists in Firebase');
      }
      
      if (error.response?.data?.error?.message === 'WEAK_PASSWORD') {
        return ctx.badRequest('Password is too weak');
      }
      
      return ctx.badRequest('Registration failed');
    }
  },

  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email and password are required');
    }

    try {
      // Check if user exists in Strapi
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email },
        populate: { role: true },
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (user.blocked) {
        return ctx.badRequest('User is blocked');
      }

      // Authenticate with Firebase
      const firebaseResponse = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );

      const { idToken } = firebaseResponse.data;

      // Sanitize user data
      const sanitizedUser = await strapi.plugins['users-permissions'].services.user.sanitizeUser(user);

      ctx.send({
        jwt: idToken,
        user: sanitizedUser,
      });
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      if (error.response?.data?.error?.message === 'INVALID_PASSWORD') {
        return ctx.badRequest('Invalid credentials');
      }
      
      if (error.response?.data?.error?.message === 'EMAIL_NOT_FOUND') {
        return ctx.badRequest('User not found in Firebase');
      }

      if (error.response?.data?.error?.message === 'USER_DISABLED') {
        return ctx.badRequest('User account is disabled');
      }
      
      return ctx.badRequest('Login failed');
    }
  },

  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    try {
      // Check if user exists in Strapi
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email },
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      // Send password reset email via Firebase
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_WEB_API_KEY}`,
        {
          requestType: 'PASSWORD_RESET',
          email,
        }
      );

      ctx.send({ message: 'Password reset email sent successfully' });
    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error.message);
      
      if (error.response?.data?.error?.message === 'EMAIL_NOT_FOUND') {
        return ctx.badRequest('Email not found in Firebase');
      }
      
      return ctx.badRequest('Failed to send password reset email');
    }
  },
}; 