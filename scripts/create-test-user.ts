
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const TEST_EMAIL = 'dealer1@car360.com';
const TEST_PASSWORD = 'Dealer123';

console.log(`Creating test user: ${TEST_EMAIL}...`);

(async () => {
    try {
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { adminAuth: auth } = adminModule;

        if (!auth) {
            console.error('Auth not initialized');
            return;
        }

        try {
            const userRecord = await auth.getUserByEmail(TEST_EMAIL);
            console.log(`User already exists: ${userRecord.uid}`);
            // Update password just in case
            await auth.updateUser(userRecord.uid, {
                password: TEST_PASSWORD
            });
            console.log('Password updated.');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await auth.createUser({
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                    emailVerified: true
                });
                console.log(`Successfully created new user: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }
    } catch (error: any) {
        console.error('Error managing user:', error);
    }
})();
