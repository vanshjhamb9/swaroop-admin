
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testStorage() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    console.log('Testing Storage with project:', projectId);

    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
            (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE,
        project_id: projectId,
        private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
        token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
        universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN,
    };

    const bucketsToTry = [
        process.env.FIREBASE_STORAGE_BUCKET,
        `${projectId}.firebasestorage.app`,
        `${projectId}.appspot.com`
    ].filter(Boolean);

    for (const bucketName of bucketsToTry) {
        console.log(`\n--- Testing bucket: ${bucketName} ---`);
        try {
            // Clear previous apps if any
            if (admin.apps.length) {
                await Promise.all(admin.apps.map(app => app.delete()));
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: bucketName
            });

            const bucket = admin.storage().bucket();
            const file = bucket.file('test-connection.txt');

            console.log('Attempting to write...');
            await file.save('Hello from test script', {
                metadata: { contentType: 'text/plain' }
            });

            console.log(`✅ SUCCESS with bucket: ${bucketName}`);

            await file.delete();
            console.log('✅ Successfully deleted test file');
            return; // Stop if one works
        } catch (error) {
            console.error(`❌ FAILED with bucket: ${bucketName}`);
            if (error.code === 404) {
                console.error('   Error: Bucket not found (404)');
            } else if (error.code === 403) {
                console.error('   Error: Permission denied (403)');
                console.error('   Message:', error.message);
            } else {
                console.error('   Error:', error.message || error);
            }
        }
    }
}

testStorage();
