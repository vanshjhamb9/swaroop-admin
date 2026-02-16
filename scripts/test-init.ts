import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

const serviceAccount = {
    type: process.env.FIREBASE_ADMIN_TYPE,
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

console.log('Project ID:', serviceAccount.project_id);
console.log('Client Email:', serviceAccount.client_email);

try {
    console.log('Attempting admin.initializeApp...');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
    });
    console.log('✅ Initialization successful!');

    const db = admin.firestore();
    console.log('Attempting Firestore document fetch...');
    const snapshot = await db.collection('users').limit(1).get();
    console.log(`✅ Success! Fetched ${snapshot.size} users.`);
} catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    if (error.stack) console.error(error.stack);
    if (error.code) console.error('Error Code:', error.code);
}
