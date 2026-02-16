
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSignIn() {
    const apiKey = process.env.FIREBASE_API_KEY;
    const email = 'customer1@gmail.com';
    const password = 'Customer123';

    console.log('Testing Sign-In for project:', process.env.FIREBASE_ADMIN_PROJECT_ID);

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        }
    );

    const data = await response.json();
    if (response.ok) {
        console.log('✅ Local sign-in SUCCESS!');
    } else {
        console.error('❌ Local sign-in FAILED:');
        console.error(JSON.stringify(data, null, 2));
    }
}

testSignIn();
