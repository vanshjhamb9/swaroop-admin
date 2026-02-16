const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
};

console.log('--- Auth Test ---');
console.log('Project ID:', serviceAccount.projectId);

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Admin initialized');

    admin.auth().listUsers(1)
        .then(result => {
            console.log('✅ Auth access verified! Users found:', result.users.length);
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Auth error:', err.message);
            if (err.code === 'auth/configuration-not-found') {
                console.log('   (Tip: Identity Platform or Auth might not be enabled for this project)');
            }
            process.exit(1);
        });
} catch (e) {
    console.error('❌ Init error:', e.message);
    process.exit(1);
}
