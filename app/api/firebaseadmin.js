import * as admin from 'firebase-admin';

// Singleton pattern to prevent multiple initializations
let app;
let db;
let auth;

function initializeFirebaseAdmin() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    app = admin.apps[0];
    db = admin.firestore();
    auth = admin.auth();
    return { app, db, auth };
  }

  // Initialize the app
  try {
    // Build service account from individual environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_ADMIN_TYPE,
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
      universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN,
    };

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Missing required Firebase Admin credentials. Check your .env file.');
    }

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`
    });

    // Get Firestore instance with optimized settings
    db = admin.firestore();

    // Configure Firestore settings ONLY on first initialization
    db.settings({
      ignoreUndefinedProperties: true,
      host: 'firestore.googleapis.com',
      ssl: true
    });

    // Get Auth instance
    auth = admin.auth();
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }

  return { app, db, auth, storage: admin.storage() };
}

// Initialize once
const { app: adminApp, db: adminFirestore, auth: adminAuth, storage: adminStorage } = initializeFirebaseAdmin();

export { adminApp, adminFirestore, adminAuth, adminStorage };