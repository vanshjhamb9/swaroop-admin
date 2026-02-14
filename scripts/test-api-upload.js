const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    console.log('--- API Image Upload Test ---');

    const form = new FormData();
    form.append('name', 'Test Vehicle');
    form.append('model', 'Grand Cherokee 2024');
    form.append('registration', 'TS-2024-Verified');
    form.append('experienceName', 'Full 360 View');

    // Create a dummy image buffer
    const dummyImage = Buffer.from('fake-image-data-' + Date.now());

    // Append images
    form.append('images', dummyImage, {
        filename: 'exterior_front.jpg',
        contentType: 'image/jpeg',
    });

    form.append('images', Buffer.from('fake-image-data-2'), {
        filename: 'interior_dashboard.png',
        contentType: 'image/png',
    });

    try {
        console.log('Sending request to http://localhost:5002/api/vehicles/create ...');
        const response = await fetch('http://localhost:5002/api/vehicles/create', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Response Body:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('\n✅ TEST SUCCESSFUL!');
            console.log('Uploaded URLs:', result.images);
        } else {
            console.log('\n❌ TEST FAILED');
        }
    } catch (error) {
        console.error('❌ Error sending request:', error.message);
        console.log('Is the dev server running at http://localhost:5002?');
    }
}

testUpload();
