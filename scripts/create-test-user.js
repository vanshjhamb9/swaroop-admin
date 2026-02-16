const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

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

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const auth = admin.auth();

async function createTestUser() {
    const email = 'tester@example.com';
    const password = 'Password123';

    try {
        const user = await auth.createUser({
            email,
            password,
            displayName: 'Test User'
        });
        console.log(`✅ User created successfully: ${user.uid}`);
    } catch (err) {
        if (err.code === 'auth/email-already-exists') {
            const user = await auth.getUserByEmail(email);
            await auth.updateUser(user.uid, { password });
            console.log(`✅ User already existed, password updated: ${user.uid}`);
        } else {
            console.error('❌ Error:', err);
        }
    }
}

createTestUser();
