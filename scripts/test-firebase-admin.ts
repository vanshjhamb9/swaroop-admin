
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const logFile = path.resolve('test-output.log');
const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Clear log file
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log('Starting test script...');

// Load .env explicitly if needed, but dotenv.config() usually looks in cwd
const result = dotenv.config();
if (result.error) {
    log(`Error loading .env: ${result.error}`);
} else {
    log('.env loaded successfully');
}

log('Loading firebaseadmin...');

(async () => {
    try {
        log('Attempting dynamic import...');
        const adminModule = await import('../app/api/firebaseadmin.js');

        log('Successfully imported firebaseadmin.');

        const { adminAuth, adminStorage } = adminModule;

        log(`Auth: ${!!adminAuth}`);
        log(`Storage: ${!!adminStorage}`);

        if (adminAuth) {
            log(`Auth app name: ${adminAuth.app.name}`);
        }

        // Try creating a custom token to verify creds work
        if (adminAuth) {
            try {
                const token = await adminAuth.createCustomToken('test-user');
                log('Custom token created successfully');
            } catch (e: any) {
                log(`Failed to create custom token: ${e.message}`);
            }
        }

    } catch (error: any) {
        log(`FAILED to import firebaseadmin: ${error.message}`);
        if (error.stack) log(error.stack);

        // Log env vars for debugging (masked)
        log(`FIREBASE_ADMIN_PROJECT_ID: ${process.env.FIREBASE_ADMIN_PROJECT_ID}`);
        const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        log(`FIREBASE_ADMIN_CLIENT_EMAIL: ${email ? email.substring(0, 5) + '...' : 'undefined'}`);
        log(`FIREBASE_ADMIN_PRIVATE_KEY present: ${!!process.env.FIREBASE_ADMIN_PRIVATE_KEY}`);
        if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
            log(`FIREBASE_ADMIN_PRIVATE_KEY length: ${process.env.FIREBASE_ADMIN_PRIVATE_KEY.length}`);
            log(`FIREBASE_ADMIN_PRIVATE_KEY starts with: ${process.env.FIREBASE_ADMIN_PRIVATE_KEY.substring(0, 20)}`);
        }
    }
})();
