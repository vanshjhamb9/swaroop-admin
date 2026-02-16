const dotenv = require('dotenv');
dotenv.config();

const admin = require('firebase-admin');

async function test() {
    console.log('Project:', process.env.FIREBASE_ADMIN_PROJECT_ID);

    // Manual init to be sure
    const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE,
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Admin Initialized');

        const auth = admin.auth();
        const email = 'dealer1@car360.com';
        console.log(`Attempting to lookup user: ${email}`);

        try {
            const user = await auth.getUserByEmail(email);
            console.log(`✅ User found: ${user.uid}`);
        } catch (e) {
            console.log(`❌ Auth Error: ${e.message} (Code: ${e.code})`);
        }

        const db = admin.firestore();
        console.log('Attempting to fetch users collection...');
        try {
            const snap = await db.collection('users').limit(1).get();
            console.log(`✅ Firestore Success! Count: ${snap.size}`);
        } catch (e) {
            console.log(`❌ Firestore Error: ${e.message} (Code: ${e.code})`);
        }

    } catch (e) {
        console.error('❌ Init Error:', e.message);
    }
}

test();
