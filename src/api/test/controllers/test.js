'use strict';

module.exports = {
  async protected(ctx) {
    // This endpoint requires authentication
    console.log('🔒 Protected endpoint called');
    console.log('ctx.state.user:', ctx.state.user);
    console.log('ctx.state:', Object.keys(ctx.state));
    
    if (!ctx.state.user) {
      console.log('❌ No user found in ctx.state');
      return ctx.unauthorized('Authentication required');
    }
    
    ctx.send({
      message: 'You are authenticated!',
      user: {
        id: ctx.state.user.id,
        username: ctx.state.user.username,
        email: ctx.state.user.email,
        role: ctx.state.user.role?.name,
      },
    });
  },

  async public(ctx) {
    // This endpoint is public
    ctx.send({
      message: 'This is a public endpoint',
    });
  },

  async status(ctx) {
    // This endpoint shows server status and Firebase config
    const firebaseConfig = {
      hasFirebase: !!strapi.firebase,
      hasWebApiKey: !!process.env.FIREBASE_WEB_API_KEY,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasServiceAccount: !!process.env.FIREBASE_CLIENT_EMAIL,
    };

    ctx.send({
      message: 'Server is running!',
      timestamp: new Date().toISOString(),
      firebase: firebaseConfig,
      environment: process.env.NODE_ENV || 'development',
    });
  },

  async testAuth(ctx) {
    // Simple test endpoint to verify middleware
    console.log('🧪 Test Auth endpoint called');
    console.log('ctx.state.user:', ctx.state.user);
    console.log('ctx.state keys:', Object.keys(ctx.state));
    console.log('ctx.request.headers:', ctx.request.headers);
    console.log('ctx.request.url:', ctx.request.url);
    
    // Force return success to bypass any other middleware
    ctx.status = 200;
    ctx.body = {
      message: 'Test auth endpoint',
      hasUser: !!ctx.state.user,
      user: ctx.state.user ? {
        id: ctx.state.user.id,
        username: ctx.state.user.username,
        email: ctx.state.user.email,
        firebaseUid: ctx.state.user.firebaseUid
      } : null,
      stateKeys: Object.keys(ctx.state),
      timestamp: new Date().toISOString()
    };
  },
}; 