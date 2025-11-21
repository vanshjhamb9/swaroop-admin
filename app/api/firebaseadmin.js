import * as admin from 'firebase-admin';

// Singleton pattern to prevent multiple initializations
let app;
let db;
let auth;

function initializeFirebaseAdmin() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin already initialized');
    app = admin.apps[0];
    db = admin.firestore();
    auth = admin.auth();
    return { app, db, auth };
  }

  console.log('🔧 Initializing Firebase Admin...');

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

    console.log('📝 Project ID:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);
    console.log('🔑 Private Key Length:', process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 'undefined');
    console.log('🔑 Private Key Starts:', process.env.FIREBASE_ADMIN_PRIVATE_KEY?.substring(0, 50));
    console.log('🔑 Private Key Ends:', process.env.FIREBASE_ADMIN_PRIVATE_KEY?.substring(-50));

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      // Explicitly set the database URL
      databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`
    });

    // Get Firestore instance
    db = admin.firestore();

    // Configure Firestore settings ONLY on first initialization
    db.settings({
      ignoreUndefinedProperties: true,
      // Ensure we're using the correct host
      host: 'firestore.googleapis.com',
      ssl: true
    });

    // Get Auth instance
    auth = admin.auth();

    console.log('✅ Firebase Admin initialized successfully');
    console.log('🔥 Firestore connected to project:', process.env.FIREBASE_ADMIN_PROJECT_ID);
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }

  return { app, db, auth };
}

// Initialize once
const { app: adminApp, db: adminFirestore, auth: adminAuth } = initializeFirebaseAdmin();

export { adminApp, adminFirestore, adminAuth };