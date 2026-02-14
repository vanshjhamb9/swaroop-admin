import * as dotenv from 'dotenv';
dotenv.config();

console.log('Testing Firestore write permissions...');

(async () => {
    try {
        const adminModule = await import('../app/api/firebaseadmin.js');
        const { db } = adminModule;

        if (!db) {
            console.error('❌ DB not initialized');
            return;
        }

        console.log('✅ Firestore initialized');

        // Try to write a test document
        const testRef = db.collection('test').doc('test-doc');
        console.log('Attempting to write test document...');

        await testRef.set({
            test: 'data',
            timestamp: new Date().toISOString()
        });

        console.log('✅ Successfully wrote test document');

        // Try to read it back
        const doc = await testRef.get();
        console.log('Document exists:', doc.exists);
        console.log('Document data:', doc.data());

        // Clean up
        await testRef.delete();
        console.log('✅ Test document deleted');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('Code:', error.code);
        console.error('Stack:', error.stack);
    }
})();
