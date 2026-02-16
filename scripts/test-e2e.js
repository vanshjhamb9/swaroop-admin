const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
console.log('--- Firebase Env Verification ---');
console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
console.log('Raw Key Length:', rawKey ? rawKey.length : 0);

if (rawKey) {
    console.log('Key starts with:', rawKey.substring(0, 30).replace(/\n/g, '[\\n]'));
}

const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n') : undefined;

const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
};

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log('✅ Admin initialized successfully!');

    const db = admin.firestore();
    const storage = admin.storage();

    async function run() {
        try {
            // Firestore Test
            await db.collection('test_connection').doc('env_test_final').set({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                source: 'final_verification',
                note: 'User updated keys'
            });
            console.log('✅ Firestore write verified!');

            // Storage Test
            const bucket = storage.bucket();
            const [exists] = await bucket.exists();
            if (exists) {
                console.log('✅ Storage bucket exists and is accessible!');
            } else {
                console.log('❌ Storage bucket NOT found:', process.env.FIREBASE_STORAGE_BUCKET);
            }
        } catch (e) {
            console.error('❌ Test failed:', e.message);
        } finally {
            process.exit(0);
        }
    }

    run();
} catch (e) {
    console.error('❌ Initialization failed:', e.message);
    process.exit(1);
}
