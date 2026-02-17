const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function testLocalUpload() {
    console.log('🚀 Checking localhost for file upload capability...');

    try {
        // 1. Create a dummy file
        const testFile = 'test_upload_local.txt';
        fs.writeFileSync(testFile, 'This is a test file for upload verification.');

        // 2. Prepare Form Data
        const form = new FormData();
        form.append('name', 'Localhost Debug Car');
        form.append('model', 'Debug Model');
        form.append('registration', 'DEBUG-LOCAL');
        form.append('experienceName', 'Debug Experience');
        // Ensure accurate file stream submission
        form.append('images', fs.createReadStream(testFile));

        // 3. Submit to Local API
        // Note: We bypass auth for localhost test if not required, or use a dummy token
        // The API code has a bypass for 'test-dealer-verified' if no token
        console.log(`📡 Sending POST to ${BASE_URL}/api/vehicles/create...`);

        const response = await fetch(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders(),
                // No Auth header to trigger test bypass
            }
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (data.images && data.images.length > 0) {
            console.log('✅ SUCCESS: Localhost returned images in response.');
        } else {
            console.log('❌ FAILURE: Localhost returned empty images.');
        }

        // Cleanup
        fs.unlinkSync(testFile);

    } catch (error) {
        console.error('❌ Error testing localhost:', error);
    }
}

testLocalUpload();
