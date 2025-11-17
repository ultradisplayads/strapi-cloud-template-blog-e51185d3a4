module.exports = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": ["'self'", "data:", "blob:", "https:"],
          "media-src": ["'self'", "data:", "blob:", "https:"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://localhost:5173", // Vite dev server
        "http://localhost:4200", // Angular dev server
        "http://localhost:8080", // Vue dev server
        "http://localhost:3002", // Additional React port
        "http://localhost:5000", // Additional dev port
        "https://pattaya1.com", // Production domain
        "https://pattaya1-staging.up.railway.app", // Railway staging deployment
        "*", // Allow all origins in development (remove in production)
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      headers: ["Content-Type", "Authorization", "Origin", "Accept"],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      formLimit: "64mb",
      jsonLimit: "64mb",
      textLimit: "64mb",
      formidable: {
        maxFileSize: 64 * 1024 * 1024,
      },
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  {
    name: "global::firebase-auth",
    config: {},
  },
];
