import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const TEST_EMAIL = 'dealer1@car360.com';
const TEST_PASSWORD = 'Dealer123';
const logFile = 'firestore-fix.log';

const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log('=== FIXING FIRESTORE SETUP ===\n');

(async () => {
    try {
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { adminAuth, adminFirestore } = adminModule;

        // Step 1: Get the exact user ID from Firebase Auth
        log('Step 1: Getting user from Firebase Auth...');
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(TEST_EMAIL);
            log(`✅ Found user: ${userRecord.uid}`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                log('User not found in Auth, creating...');
                userRecord = await adminAuth.createUser({
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                    emailVerified: true
                });
                log(`✅ Created user: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }

        const userId = userRecord.uid;
        log(`\nUser ID to use: ${userId}`);

        // Step 2: Create document in users collection with EXACT user ID
        log('\nStep 2: Creating document in users collection...');
        const userRef = adminFirestore.collection('users').doc(userId);

        await userRef.set({
            email: TEST_EMAIL,
            name: 'Test Dealer',
            role: 'customer',
            createdAt: new Date().toISOString(),
            isActive: true
        }, { merge: true }); // Use merge to update if exists

        log(`✅ Document created/updated: users/${userId}`);

        // Step 3: Verify it was created
        log('\nStep 3: Verifying document...');
        const doc = await userRef.get();
        log(`Document exists: ${doc.exists}`);
        if (doc.exists) {
            log(`Document data: ${JSON.stringify(doc.data(), null, 2)}`);
        } else {
            log('❌ ERROR: Document was not created!');
        }

        // Step 4: Also create in dealers collection
        log('\nStep 4: Creating document in dealers collection...');
        const dealerRef = adminFirestore.collection('dealers').doc(userId);
        await dealerRef.set({
            email: TEST_EMAIL,
            name: 'Test Dealer',
            businessName: 'Test Dealership',
            role: 'dealer',
            createdAt: new Date().toISOString(),
            isActive: true
        }, { merge: true });
        log(`✅ Document created/updated: dealers/${userId}`);

        log('\n=== SETUP COMPLETE ===');
        log(`Email: ${TEST_EMAIL}`);
        log(`Password: ${TEST_PASSWORD}`);
        log(`User ID: ${userId}`);
        log('\nNow run: node scripts/verify-image-upload.js');

    } catch (error: any) {
        log(`\n❌ ERROR: ${error.message}`);
        log(`Stack: ${error.stack}`);
    }
})();
