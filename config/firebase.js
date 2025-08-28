const admin = require('firebase-admin');

const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

const hasRequiredCreds = Boolean(
  serviceAccount.project_id &&
  serviceAccount.client_email &&
  serviceAccount.private_key
);

if (!admin.apps.length && hasRequiredCreds) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else if (!hasRequiredCreds) {
  // Skip initialization in environments without Firebase credentials
  // This allows Strapi to build/run without Firebase configured (middleware will no-op)
  // console.warn kept minimal to avoid noisy logs in build output
  console.warn('Firebase credentials not found. Skipping Firebase Admin initialization.');
}

module.exports = admin; 