import * as dotenv from 'dotenv';
dotenv.config();

const TEST_EMAIL = 'dealer1@car360.com';

console.log(`Checking user setup for: ${TEST_EMAIL}...`);

async function main() {
    try {
        console.log('Loading firebaseadmin...');
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { adminAuth, adminFirestore } = adminModule;

        if (!adminAuth || !adminFirestore) {
            console.error('❌ Auth or Firestore not export from firebaseadmin');
            return;
        }

        console.log('Firebase Admin loaded successfully.');

        // Check Auth
        let userId: string;
        try {
            const userRecord = await adminAuth.getUserByEmail(TEST_EMAIL);
            userId = userRecord.uid;
            console.log(`✅ Auth user exists: ${userId}`);
        } catch (error: any) {
            console.error(`❌ User not found in Auth: ${error.message}`);
            return;
        }

        // Check users collection
        console.log(`Fetching users document for ${userId}...`);
        try {
            const userDoc = await adminFirestore.collection('users').doc(userId).get();
            console.log(`Users collection - exists: ${userDoc.exists}`);
            if (userDoc.exists) {
                console.log('  Data:', JSON.stringify(userDoc.data(), null, 2));
            }
        } catch (e: any) {
            console.error(`❌ Error fetching users doc: ${e.message}`);
            console.error(e);
        }

        // Check dealers collection
        console.log(`Fetching dealers document for ${userId}...`);
        try {
            const dealerDoc = await adminFirestore.collection('dealers').doc(userId).get();
            console.log(`Dealers collection - exists: ${dealerDoc.exists}`);
            if (dealerDoc.exists) {
                console.log('  Data:', JSON.stringify(dealerDoc.data(), null, 2));
            }
        } catch (e: any) {
            console.error(`❌ Error fetching dealers doc: ${e.message}`);
        }

    } catch (error: any) {
        console.error('❌ Unexpected Error in main:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

main().then(() => console.log('Script execution finished.')).catch(e => console.error('Unhandled rejcetion:', e));
