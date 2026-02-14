import * as dotenv from 'dotenv';
dotenv.config();

const TEST_EMAIL = 'dealer1@car360.com';

console.log(`Checking Firestore for: ${TEST_EMAIL}...`);

(async () => {
    try {
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { auth, db } = adminModule;

        // Get user ID from Auth
        const userRecord = await auth.getUserByEmail(TEST_EMAIL);
        const userId = userRecord.uid;
        console.log(`User ID: ${userId}`);

        // Check all collections
        const collections = ['users', 'dealers', 'admins'];

        for (const collectionName of collections) {
            const doc = await db.collection(collectionName).doc(userId).get();
            console.log(`\n${collectionName}/${userId}:`);
            console.log(`  Exists: ${doc.exists}`);
            if (doc.exists) {
                console.log(`  Data:`, JSON.stringify(doc.data(), null, 2));
            }
        }

        // Also check if there are ANY documents in users collection
        console.log('\n--- All documents in users collection ---');
        const usersSnapshot = await db.collection('users').limit(10).get();
        console.log(`Total documents: ${usersSnapshot.size}`);
        usersSnapshot.forEach(doc => {
            console.log(`  ${doc.id}:`, doc.data());
        });

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
})();
