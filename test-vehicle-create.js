
/**
 * Test Vehicle Creation on Production
 * Usage: node test-vehicle-create.js <email> <password>
 */

const PRODUCTION_URL = 'https://urbanuplink.ai';

async function testVehicleCreate(email, password) {
    try {
        console.log('🌐 Logging into Production...');
        const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginData.error);
            return;
        }

        const token = loginData.data.idToken;
        console.log('✅ Token obtained. Attempting to create vehicle...');

        const formData = new FormData();
        formData.append('name', 'Test Mercedes');
        formData.append('model', 'C-Class');
        formData.append('registration', 'MH-01-TS-' + Math.floor(Math.random() * 9999));
        formData.append('experienceName', 'Test Experience');
        formData.append('imageCount', '0'); // No actual images for this quick test

        const createResponse = await fetch(`${PRODUCTION_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const createData = await createResponse.json();
        console.log(`📡 Status: ${createResponse.status}`);

        if (createResponse.ok) {
            console.log('✅ SUCCESS: Vehicle created in production!');
            console.log('Response:', createData);
        } else {
            console.log('❌ FAILED:');
            console.log(JSON.stringify(createData, null, 2));
        }

    } catch (error) {
        console.error('❌ Error testing production:', error);
    }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node test-vehicle-create.js <email> <password>');
} else {
    testVehicleCreate(email, password);
}
