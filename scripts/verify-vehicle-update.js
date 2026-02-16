
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://127.0.0.1:5000';
const TEST_EMAIL = 'dealer1@car360.com';
const TEST_PASSWORD = 'Dealer123';

async function verifyVehicleUpdate() {
    try {
        console.log('🔐 Logging in to get token...');

        // 1. Login to get token
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });

        const responseText = await loginResponse.text();
        console.log('Login Response Status:', loginResponse.status);
        console.log('Login Response Text:', responseText);

        let loginData;
        try {
            loginData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Failed to parse login response: ${responseText.substring(0, 200)}...`);
        }

        if (!loginData.success || !loginData.data?.idToken) {
            throw new Error('Login failed: ' + JSON.stringify(loginData));
        }

        const token = loginData.data.idToken;
        console.log('✅ Login successful');

        // 2. Create Vehicle with new fields
        console.log('\n🚗 Creating test vehicle...');
        const vehicleData = {
            name: "Test Vehicle " + Date.now(),
            model: "Test Model",
            registration: "TS-TEST-" + Math.floor(Math.random() * 1000),
            imageCount: 5,
            experienceName: "Luxury Experience", // NEW FIELD
            images: [ // NEW FIELD
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg"
            ]
        };

        const createResponse = await fetch(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicleData)
        });

        const createResult = await createResponse.json();
        console.log('Create Response:', createResult);

        if (!createResult.id) { // Check for ID instead of success flag based on route.ts
            if (createResult.error) throw new Error('Creation failed: ' + createResult.error);
            // It might just return { id: ..., message: ... }
        }

        console.log('✅ Vehicle created. ID:', createResult.id);

        // 3. List Vehicles and verify fields
        console.log('\n📋 Fetching vehicle list...');
        const listResponse = await fetch(`${BASE_URL}/api/vehicles/list`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const listResult = await listResponse.json();

        if (listResult.error) {
            throw new Error('List failed: ' + listResult.error);
        }

        // Find our created vehicle
        const createdVehicle = listResult.vehicles.find(v => v.id === createResult.id);

        if (!createdVehicle) {
            throw new Error('Created vehicle not found in list!');
        }

        console.log('\n🔍 Verifying new fields...');
        console.log('Experience Name:', createdVehicle.experienceName);
        console.log('Images:', createdVehicle.images);

        let success = true;

        if (createdVehicle.experienceName !== vehicleData.experienceName) {
            console.error('❌ Experience Name mismatch!');
            success = false;
        } else {
            console.log('✅ Experience Name matches');
        }

        if (!Array.isArray(createdVehicle.images) || createdVehicle.images.length !== 2) {
            console.error('❌ Images array mismatch!');
            success = false;
        } else {
            console.log('✅ Images array matches');
        }

        if (success) {
            console.log('\n✅✅✅ VERIFICATION SUCCESSFUL ✅✅✅');
        } else {
            console.log('\n❌❌❌ VERIFICATION FAILED ❌❌❌');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

verifyVehicleUpdate();
