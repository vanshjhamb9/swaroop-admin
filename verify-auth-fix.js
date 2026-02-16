
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyAuth() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    console.log('Testing Auth on project:', projectId);

    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
            (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const serviceAccount = {
        project_id: projectId,
        private_key: privateKey,
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        const email = 'customer1@gmail.com';
        const password = 'Customer123';

        try {
            console.log('Attempting to create test user...');
            const user = await admin.auth().createUser({
                email,
                password,
                displayName: 'Verify Test User'
            });
            console.log('✅ User created successfully:', user.uid);
        } catch (e) {
            if (e.code === 'auth/email-already-exists') {
                console.log('User already exists, updating password...');
                const user = await admin.auth().getUserByEmail(email);
                await admin.auth().updateUser(user.uid, { password });
                console.log('✅ Password updated for existing user');
            } else {
                throw e;
            }
        }

        console.log('\n--- SUCCESS ---');
        console.log('Email/Password provider is working on production.');
        console.log('You can now log in with:');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('❌ Auth test failed:');
        console.error(error.message);
    }
}

verifyAuth();
