'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Skip Firebase auth for admin routes
    if (ctx.request.url.startsWith('/admin')) {
      return next();
    }
    
    // Skip Firebase auth for non-API routes
    if (!ctx.request.url.startsWith('/api')) {
      return next();
    }
    
    // Skip Firebase auth for Firebase auth endpoints (they need to be public)
    if (ctx.request.url.includes('/api/firebase-auth/')) {
      console.log('🔥 Firebase Auth Middleware: Skipping authentication for Firebase auth endpoint:', ctx.request.url);
      return next();
    }
    
    // Also skip for the exact paths
    if (ctx.request.url === '/api/firebase-auth/login' || 
        ctx.request.url === '/api/firebase-auth/register' || 
        ctx.request.url === '/api/firebase-auth/forgot-password') {
      console.log('🔥 Firebase Auth Middleware: Skipping authentication for exact Firebase auth path:', ctx.request.url);
      return next();
    }
    
    // Skip Firebase auth for public news endpoints
    const publicEndpoints = [
      '/api/breaking-news',
      '/api/news-articles', 
      '/api/trending-topics',
      '/api/traffic-routes',
      '/api/traffic-incidents',
      '/api/deals',
      '/api/google-reviews',
      '/api/quick-links',
      '/api/flight-tracker',
      '/api/travel-widget',
      '/api/currency-converter'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      ctx.request.url.startsWith(endpoint)
    );
    
    if (isPublicEndpoint) {
      console.log('🔥 Public endpoint, skipping authentication');
      return next();
    }
    
    console.log('🔥 Firebase Auth Middleware: Request to', ctx.request.url);
    const token = ctx.request.header.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('🔥 No token found, skipping authentication');
      return next();
    }

    try {
      // First try to verify as Strapi JWT
      try {
        const jwtService = strapi.plugins['users-permissions'].services.jwt;
        const { id } = await jwtService.verify(token);
        
        if (id) {
          const user = await strapi.entityService.findOne('plugin::users-permissions.user', id, {
            populate: { role: true },
          });
          
          if (user && !user.blocked) {
            ctx.state.user = user;
            return next();
          }
        }
      } catch (jwtError) {
        // JWT verification failed, try Firebase token if admin is initialized
        try {
          if (!strapi.firebase?.apps?.length) {
            console.log('Firebase Admin not initialized. Skipping Firebase token verification.');
            return next();
          }
          const decodedToken = await strapi.firebase.auth().verifyIdToken(token);
          
          if (decodedToken && decodedToken.uid) {
            console.log('✅ Firebase token verified successfully');
            console.log('Looking for user with firebaseUid:', decodedToken.uid);
            
            const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
              filters: { firebaseUid: decodedToken.uid },
              populate: { role: true },
            });
            
            console.log('Users found:', users.length);
            if (users && users.length > 0) {
              console.log('User details:', {
                id: users[0].id,
                username: users[0].username,
                email: users[0].email,
                firebaseUid: users[0].firebaseUid,
                blocked: users[0].blocked
              });
            }
            
            if (users && users.length > 0 && !users[0].blocked) {
              console.log('✅ User found and not blocked, setting ctx.state.user');
              ctx.state.user = users[0];
              return next();
            } else {
              console.log('❌ User not found or blocked');
            }
          }
        } catch (firebaseError) {
          console.error('Firebase token verification failed:', firebaseError);
          
          // Try to decode the token manually to see what type it is
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
              const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
              
              console.log('Token analysis:');
              console.log('- Algorithm:', header.alg);
              console.log('- Token type:', header.typ);
              console.log('- Has kid:', !!header.kid);
              console.log('- Issuer:', payload.iss);
              console.log('- Subject:', payload.sub);
              console.log('- Audience:', payload.aud);
              
              // If this is a custom token (no kid), we can't verify it server-side
              if (!header.kid) {
                console.log('This appears to be a custom token from Firebase REST API');
                console.log('Custom tokens cannot be verified server-side without additional setup');
                console.log('You need to use Firebase Web SDK to get proper ID tokens');
              }
            }
          } catch (decodeError) {
            console.log('Could not decode token for analysis');
          }
        }
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
    }
    
    return next();
  };
}; 