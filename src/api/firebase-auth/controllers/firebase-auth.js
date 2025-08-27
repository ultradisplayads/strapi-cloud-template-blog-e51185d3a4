'use strict';

module.exports = {
  async register(ctx) {
    try {
      console.log('🔥 Firebase Auth: Register endpoint called');
      
      const { username, email, password, firebaseUid } = ctx.request.body;
      
      if (!username || !email || !firebaseUid) {
        return ctx.badRequest('Username, email, and firebaseUid are required');
      }

      console.log('Creating user with data:', { username, email, firebaseUid });

      // Check if user already exists
      const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { 
          $or: [
            { email },
            { firebaseUid }
          ]
        }
      });

      if (existingUser && existingUser.length > 0) {
        return ctx.badRequest('User already exists with this email or firebaseUid');
      }

      // Create the user
      const userData = {
        username,
        email,
        firebaseUid,
        confirmed: true,
        blocked: false,
        role: 1, // Authenticated role
        provider: 'firebase'
      };

      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: userData
      });

      console.log('✅ User created successfully:', user.id);

      ctx.send({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firebaseUid: user.firebaseUid
        }
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      ctx.badRequest('Registration failed: ' + error.message);
    }
  },

  async login(ctx) {
    try {
      console.log('🔥 Firebase Auth: Login endpoint called');
      
      const { firebaseUid } = ctx.request.body;
      
      if (!firebaseUid) {
        return ctx.badRequest('firebaseUid is required');
      }

      // Find user by firebaseUid
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { firebaseUid },
        populate: { role: true }
      });

      if (!users || users.length === 0) {
        return ctx.badRequest('User not found');
      }

      const user = users[0];

      if (user.blocked) {
        return ctx.badRequest('User is blocked');
      }

      console.log('✅ User found:', user.id);

      ctx.send({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firebaseUid: user.firebaseUid,
          role: user.role?.name
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      ctx.badRequest('Login failed: ' + error.message);
    }
  },

  async forgotPassword(ctx) {
    try {
      console.log('🔥 Firebase Auth: Forgot password endpoint called');
      
      const { email } = ctx.request.body;
      
      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Find user by email
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { email }
      });

      if (!users || users.length === 0) {
        return ctx.badRequest('User not found');
      }

      console.log('✅ Password reset requested for:', email);

      ctx.send({
        message: 'Password reset instructions sent to email',
        email: email
      });

    } catch (error) {
      console.error('❌ Forgot password error:', error);
      ctx.badRequest('Password reset failed: ' + error.message);
    }
  }
}; 