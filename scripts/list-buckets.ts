
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const logFile = path.resolve('bucket-list.log');
const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log('Attempting to list storage buckets...');

(async () => {
    try {
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { adminStorage, adminApp } = adminModule;

        if (!adminStorage) {
            log('Admin Storage not initialized');
            return;
        }

        // adminStorage is the Storage service.
        // It has a bucket() method.
        // The Bucket instance has a storage property which is the GCS Storage client.
        // However, in some versions of firebase-admin, accessing .storage might be internal.
        // But usually it exposes the @google-cloud/storage Bucket which has .storage reference.

        try {
            const gcsClient = adminStorage.bucket().storage;

            log('Fetching buckets via GCS client...');
            // getBuckets() returns [Bucket[]]
            const [buckets] = await gcsClient.getBuckets();

            if (buckets.length === 0) {
                log('No buckets found! Please create a Storage bucket in Firebase Console.');
            } else {
                log('\n✅ Available Buckets:');
                buckets.forEach((bucket: any) => {
                    log(`- ${bucket.name}`);
                });
                log('\nPlease use one of these names in your .env file as FIREBASE_STORAGE_BUCKET');
            }
        } catch (innerErr: any) {
            log(`Failed to list buckets via GCS client: ${innerErr.message}`);
            throw innerErr;
        }

    } catch (e: any) {
        log(`Error: ${e.message}`);
        if (e.code === 403) {
            log('NOTE: The service account might not have "Storage Admin" or "Viewer" roles to list buckets.');
        }

        // Print configured default
        try {
            const app = (await import('../app/api/firebaseadmin.js')).adminApp;
            log(`Current configured default bucket: ${app.options.storageBucket}`);
        } catch (confErr) {
            log('Could not read default config.');
        }
    }
})();
