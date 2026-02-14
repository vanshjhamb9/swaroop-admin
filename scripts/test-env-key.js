const admin = require('firebase-admin');
const crypto = require('crypto');

console.log('--- Dummy Key Environment Test ---');

try {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "dummy-project",
            clientEmail: "dummy@example.com",
            privateKey: privateKey,
        }),
    }, 'dummy-app');

    console.log('✅ Admin initialized successfully with a DUMMY key!');
    console.log('This confirms the environment can parse PKCS#8 keys.');
    process.exit(0);
} catch (e) {
    console.error('❌ Dummy initialization failed:', e.message);
    process.exit(1);
}
