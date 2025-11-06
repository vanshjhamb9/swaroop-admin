// pages/api/firebaseAdmin.js

import admin from "firebase-admin";
// const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once (Singleton pattern) - server-side only
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            type: process.env.FIREBASE_ADMIN_TYPE,
            project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
            private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newline characters
            client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
            auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
            token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
            client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
            universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN
        }),
    });
}

// async function assignSuperAdmin(uid) {
//     try {
//         await admin.auth().setCustomUserClaims(uid, { admin: true });
//         console.log(`Admin claim assigned to user with UID: ${uid}`);
//     } catch (error) {
//         console.error("Error assigning admin claim:", error);
//     }
// }

// // Call the function with the Super Admin's UID
// const superAdminUID = "bpzPUAg2wLZz4eljAwGFyZ0f6yF2"; // Replace with your Super Admin's UID
// assignSuperAdmin(superAdminUID);
export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();