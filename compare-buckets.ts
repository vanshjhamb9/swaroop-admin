
import * as dotenv from 'dotenv';
import path from 'path';
import * as admin from 'firebase-admin';
import fs from 'fs';

async function listBuckets(envFile) {
    console.log(`\n--- Testing ${envFile} ---`);
    const envPath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) {
        console.log(`${envFile} not found`);
        return;
    }

    // Clear current app
    if (admin.apps.length) await Promise.all(admin.apps.map(a => a.delete()));

    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    const projectId = envConfig.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = envConfig.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = envConfig.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    console.log('Project:', projectId);

    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey
            } as any),
            projectId
        });

        // Use a dummy bucket name just to get the storage object
        const gcs = admin.storage().bucket('dummy').storage;
        const [buckets] = await gcs.getBuckets();
        if (buckets.length === 0) {
            console.log('No buckets found in this project.');
        } else {
            console.log('Buckets discovered:', buckets.map(b => b.name));
        }
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

(async () => {
    await listBuckets('.env.local');
    await listBuckets('.env');
})();
