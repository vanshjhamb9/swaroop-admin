
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://127.0.0.1:5002';
const TEST_EMAIL = 'dealer1@car360.com';
const TEST_PASSWORD = 'Dealer123';

async function verifyImageUpload() {
    try {
        console.log('🔐 Logging in to get token...');

        // Use native fetch if available, else try require (compatibility)
        const fetchFn = global.fetch || require('node-fetch');

        // 1. Login
        const loginResponse = await fetchFn(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.data?.idToken;

        if (!token) {
            throw new Error('No token received from login');
        }
        console.log('✅ Login successful');

        // 2. Prepare FormData
        console.log('\n📤 Preparing multipart upload...');
        const formData = new FormData();

        formData.append('name', "Binary Upload Test " + Date.now());
        formData.append('model', "Test Model X");
        formData.append('registration', "UP-LOAD-" + Math.floor(Math.random() * 1000));
        formData.append('experienceName', "Upload Experience");
        formData.append('imageCount', '2');

        // Create dummy files
        // In Node.js global FormData (v18+), we can use Blob.
        const blob1 = new Blob(['dummy image content 1'], { type: 'image/jpeg' });
        const blob2 = new Blob(['dummy image content 2'], { type: 'image/png' });

        formData.append('images', blob1, 'test-image-1.jpg');
        formData.append('images', blob2, 'test-image-2.png');

        // 3. Upload
        console.log('🚀 Sending POST request to /api/vehicles/create...');
        const createResponse = await fetchFn(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Content-Type header is set automatically by FormData with boundary
            },
            body: formData
        });

        const responseText = await createResponse.text();
        console.log('Response status:', createResponse.status);
        console.log('Response body:', responseText);

        if (!createResponse.ok) {
            throw new Error(`Upload failed: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        console.log('✅ Upload successful! Vehicle ID:', result.id);
        console.log('Received images:', result.images);

        // 4. Verify images URLs are correct (should be firebase storage URLs)
        if (result.images && result.images.length === 2 && result.images[0].includes('firebasestorage')) {
            console.log('✅ Image URLs look valid (contain firebasestorage)');
        } else {
            console.warn('⚠️ Image URLs might be invalid or missing:', result.images);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        // Don't exit with error, just log it. The server might not be running.
    }
}

verifyImageUpload();
