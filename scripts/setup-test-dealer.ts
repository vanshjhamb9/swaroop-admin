import * as dotenv from 'dotenv';
dotenv.config();

const TEST_EMAIL = 'dealer1@car360.com';
const TEST_PASSWORD = 'Dealer123';

console.log(`Setting up complete test dealer: ${TEST_EMAIL}...`);

(async () => {
    try {
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { adminAuth: auth, adminFirestore: db } = adminModule;

        if (!auth || !db) {
            console.error('❌ Auth or DB not initialized');
            return;
        }

        // Step 1: Create or get user in Firebase Auth
        let userId: string;
        try {
            const userRecord = await auth.getUserByEmail(TEST_EMAIL);
            userId = userRecord.uid;
            console.log(`✅ User already exists in Auth: ${userId}`);

            await auth.updateUser(userId, { password: TEST_PASSWORD });
            console.log('✅ Password updated');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await auth.createUser({
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                    emailVerified: true
                });
                userId = userRecord.uid;
                console.log(`✅ Created new user in Auth: ${userId}`);
            } else {
                throw error;
            }
        }

        // Step 2: Create document in USERS collection (required by login route)
        const userRef = db.collection('users').doc(userId);
        await userRef.set({
            email: TEST_EMAIL,
            name: 'Test Dealer',
            role: 'customer', // Default role
            createdAt: new Date().toISOString(),
            isActive: true
        });
        console.log(`✅ Created/Updated Firestore document in users/${userId}`);

        // Step 3: Create document in DEALERS collection (for dealer role)
        const dealerRef = db.collection('dealers').doc(userId);
        await dealerRef.set({
            email: TEST_EMAIL,
            name: 'Test Dealer',
            businessName: 'Test Dealership',
            role: 'dealer',
            createdAt: new Date().toISOString(),
            isActive: true
        });
        console.log(`✅ Created/Updated Firestore document in dealers/${userId}`);

        console.log('\n✅ Test dealer setup complete!');
        console.log(`Email: ${TEST_EMAIL}`);
        console.log(`Password: ${TEST_PASSWORD}`);
        console.log(`User ID: ${userId}`);
        console.log('\nYou can now run: node scripts/verify-image-upload.js');

    } catch (error: any) {
        console.error('❌ Error setting up test dealer:', error.message);
        console.error('Stack:', error.stack);
    }
})();
