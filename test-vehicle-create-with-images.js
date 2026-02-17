/**
 * Test script for vehicle creation with images in production
 * Usage: node test-vehicle-create-with-images.js <email> <password> [imagePath]
 * 
 * Note: Requires form-data package: npm install form-data
 */

const PRODUCTION_URL = 'https://www.urbanuplink.ai';
const fs = require('fs');
const path = require('path');

// Try to load form-data, provide helpful error if not available
let FormData;
try {
    FormData = require('form-data');
} catch (e) {
    console.error('❌ Error: form-data package not found.');
    console.error('Please install it: npm install form-data');
    process.exit(1);
}

async function testVehicleCreateWithImages(email, password, imagePath) {
    try {
        console.log('🌐 Logging into Production...');
        const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginData);
            return;
        }

        const token = loginData.data?.idToken || loginData.idToken;
        if (!token) {
            console.error('❌ No token received:', loginData);
            return;
        }

        console.log('✅ Token obtained. Creating vehicle with images...');

        const formData = new FormData();
        formData.append('name', 'Test Vehicle with Images');
        formData.append('model', 'C-Class 2024');
        formData.append('registration', 'TEST-' + Math.floor(Math.random() * 9999));
        formData.append('experienceName', 'Production Test Experience');

        // Add images if provided
        if (imagePath && fs.existsSync(imagePath)) {
            console.log(`📷 Adding image: ${imagePath}`);
            formData.append('images', fs.createReadStream(imagePath), {
                filename: path.basename(imagePath),
                contentType: 'image/png'
            });
            formData.append('imageCount', '1');
        } else {
            console.log('⚠️  No image provided, testing without images');
            formData.append('imageCount', '0');
        }

        console.log('📤 Sending request to production...');
        const createResponse = await fetch(`${PRODUCTION_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            },
            body: formData,
        });

        const createData = await createResponse.json();
        console.log(`\n📡 Status: ${createResponse.status} ${createResponse.statusText}`);

        if (createResponse.ok) {
            console.log('\n✅ SUCCESS: Vehicle created in production!');
            console.log('📋 Response:');
            console.log(JSON.stringify(createData, null, 2));
            
            // Verify images array
            if (createData.images && Array.isArray(createData.images) && createData.images.length > 0) {
                console.log('\n✅ Images array is populated!');
                console.log(`📸 Found ${createData.images.length} image URL(s):`);
                createData.images.forEach((url, index) => {
                    console.log(`   ${index + 1}. ${url}`);
                });
                
                // Verify URL format
                const firstUrl = createData.images[0];
                if (firstUrl.includes('firebasestorage.googleapis.com') && firstUrl.includes('token=')) {
                    console.log('\n✅ Image URL format is correct!');
                } else {
                    console.log('\n⚠️  Warning: Image URL format might be incorrect');
                }
            } else {
                console.log('\n❌ ERROR: Images array is empty!');
                console.log('Expected image URLs but got:', createData.images);
            }
        } else {
            console.log('\n❌ FAILED:');
            console.log(JSON.stringify(createData, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Error testing production:', error.message);
        console.error(error.stack);
    }
}

const email = process.argv[2];
const password = process.argv[3];
const imagePath = process.argv[4];

if (!email || !password) {
    console.log('Usage: node test-vehicle-create-with-images.js <email> <password> [imagePath]');
    console.log('\nExample:');
    console.log('  node test-vehicle-create-with-images.js dealer@example.com password123 ./test-image.png');
    console.log('\nNote: Requires form-data package: npm install form-data');
} else {
    testVehicleCreateWithImages(email, password, imagePath);
}
