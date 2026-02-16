
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function fullTest() {
    const apiKey = process.env.FIREBASE_API_KEY;
    const email = 'final_test_' + Date.now() + '@car360.com';
    const password = 'FixedPassword123!';

    console.log('Project:', process.env.FIREBASE_ADMIN_PROJECT_ID);

    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
            (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
                private_key: privateKey,
                client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            }),
        });

        console.log('1. Creating user via Admin SDK:', email);
        const user = await admin.auth().createUser({ email, password });
        console.log('   ✅ User created:', user.uid);

        console.log('2. Trying to sign in via API Key...');
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true })
            }
        );

        const data = await response.json();
        if (response.ok) {
            console.log('   ✅ Sign-in SUCCESS!');
            console.log('   Token starts with:', data.idToken.substring(0, 10) + '...');
        } else {
            console.error('   ❌ Sign-in FAILED:', data.error.message);
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

fullTest();
