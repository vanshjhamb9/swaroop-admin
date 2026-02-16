
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

async function crossProjectTest() {
    const envConfig = dotenv.parse(require('fs').readFileSync('.env'));
    const envLocalConfig = dotenv.parse(require('fs').readFileSync('.env.local'));

    const email = 'cross_test_' + Date.now() + '@car360.com';
    const password = 'CrossPassword123!';

    console.log('--- Project uplai-aeff0 (.env) ---');
    let pk = envConfig.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (pk.startsWith('"')) pk = pk.slice(1, -1);

    admin.initializeApp({
        credential: admin.credential.cert({
            project_id: envConfig.FIREBASE_ADMIN_PROJECT_ID,
            client_email: envConfig.FIREBASE_ADMIN_CLIENT_EMAIL,
            private_key: pk
        })
    });

    console.log('1. Creating user in uplai-aeff0...');
    await admin.auth().createUser({ email, password });
    console.log('   ✅ Created.');

    console.log('2. Trying Key from .env (ending ...B70RY)...');
    let res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${envConfig.FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    let data = await res.json();
    console.log('   Result:', res.ok ? '✅ SUCCESS' : '❌ FAILED: ' + data.error.message);

    console.log('3. Trying Key from .env.local (ending ...7_pww)...');
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${envLocalConfig.FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    data = await res.json();
    console.log('   Result:', res.ok ? '✅ SUCCESS' : '❌ FAILED: ' + data.error.message);
}

crossProjectTest();
