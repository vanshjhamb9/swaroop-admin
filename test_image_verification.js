const fetch = require('node-fetch');

const BASE_URL = 'https://www.urbanuplink.ai';

async function runNotGettingImagesTest() {
    console.log('🚀 Starting Image Verification Test...');

    // 1. Login
    console.log('\nSTEP 1: Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'dealer1@car360.com',
            password: 'Dealer123'
        })
    });

    if (!loginResponse.ok) {
        console.error('Login Failed:', await loginResponse.text());
        return;
    }

    const { data: { idToken } } = await loginResponse.json();
    console.log('✅ Login Successful.');

    // 2. Create Experience (Vehicle) with Image
    console.log('\nSTEP 2: Creating Vehicle with Dummy Image URL...');
    const timestamp = Date.now();
    const testImage = `https://via.placeholder.com/150?text=TestImage_${timestamp}`;

    const createData = {
        name: `Test Car ${timestamp}`,
        model: "Test Model",
        registration: `TEST-${timestamp}`,
        experienceName: `Experience ${timestamp}`,
        images: [testImage],
        imageCount: 1
    };

    const createResponse = await fetch(`${BASE_URL}/api/vehicles/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(createData)
    });

    if (!createResponse.ok) {
        console.error('❌ Create Failed:', await createResponse.text());
        return;
    }

    const createResult = await createResponse.json();
    console.log('✅ Vehicle Created.');

    // 3. Fetch List to Verify
    console.log('\nSTEP 3: Fetching Experiences List...');
    const listResponse = await fetch(`${BASE_URL}/api/experiences/list`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}`
        }
    });

    if (!listResponse.ok) {
        console.error('❌ List Verification Failed:', await listResponse.text());
        return;
    }

    const listData = await listResponse.json();

    // Find our new experience
    const newExp = listData.data.experiences.find(e =>
        e.vehicles[0].name === createData.name
    );

    if (newExp) {
        console.log('✅ Found newly created experience!');
        console.log('--- NEW EXPERIENCE JSON ---');
        console.log(JSON.stringify(newExp, null, 2));
        console.log('---------------------------');

        const images = newExp.vehicles[0].images;
        if (images.includes(testImage)) {
            console.log('🎉 SUCCESS: The image URL is present in the list!');
        } else {
            console.error('❌ FAILURE: The image URL is MISSING!');
        }
    } else {
        console.error('❌ FAILURE: Could not find the newly created experience in the list.');
    }
}

runNotGettingImagesTest();
