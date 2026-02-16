const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.FIREBASE_API_KEY;
const email = 'tester@example.com';
const password = 'Password123';

async function testAuth() {
    console.log(`Using API Key: ${API_KEY}`);
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
}

testAuth();
