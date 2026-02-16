
const dotenv = require('dotenv');
const fs = require('fs');

async function checkKeys() {
    const env = dotenv.parse(fs.readFileSync('.env'));
    const envLocal = dotenv.parse(fs.readFileSync('.env.local'));

    async function getProject(key) {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: 'test@example.com', continueUri: 'http://localhost' })
        });
        const data = await res.json();
        return data;
    }

    console.log('Testing Key 1 (...B70RY):');
    console.log(JSON.stringify(await getProject(env.FIREBASE_API_KEY), null, 2));

    console.log('\nTesting Key 2 (...7_pww):');
    console.log(JSON.stringify(await getProject(envLocal.FIREBASE_API_KEY), null, 2));
}

checkKeys();
