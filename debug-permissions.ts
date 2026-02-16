
import * as dotenv from 'dotenv';
import path from 'path';
import * as admin from 'firebase-admin';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
    console.log('Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);

    // Initialize
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const serviceAccount = {
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as any)
        });
        console.log('✅ Initialization successful');

        const db = admin.firestore();
        const collections = await db.listCollections();
        console.log('✅ Firestore access successful. Collections:', collections.map(c => c.id));

        const storage = admin.storage();
        try {
            const [buckets] = await storage.bucket().storage.getBuckets();
            console.log('✅ Bucket listing:', buckets.map(b => b.name));
        } catch (e: any) {
            console.error('❌ Storage listing failed:', e.message);
        }
    } catch (err: any) {
        console.error('❌ Error:', err.message);
    }
}

check();
