const fetch = require('node-fetch');

const BASE_URL = 'https://www.urbanuplink.ai';

async function testProductionExperiences() {
    console.log('🚀 Starting Production API Test...');

    // 1. Login to get a valid ID Token
    console.log('\nPlease wait, logging in as dealer1@car360.com...');

    try {
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dealer1@car360.com',
                password: 'Dealer123'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.error('❌ Login Failed:', loginData);
            return;
        }

        // THIS IS THE TOKEN YOU NEED
        const idToken = loginData.data.idToken;

        console.log('✅ Login Successful!');
        console.log('🔑 RECEIVED ID TOKEN (Truncated):');
        console.log(`${idToken.substring(0, 50)}...`);
        console.log('(This is the token you must use in the Authorization header)');

        // 2. Use the ID Token to fetch experiences
        console.log('\n\n📡 Testing /api/experiences/list with valid token...');

        const expResponse = await fetch(`${BASE_URL}/api/experiences/list`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}` // IMPORTANT: "Bearer " + idToken
            }
        });

        const expData = await expResponse.json();

        console.log(`\nStatus Code: ${expResponse.status}`);

        if (expResponse.ok) {
            console.log('✅ SUCCESS! API Response:');
            console.log(JSON.stringify(expData, null, 2));
        } else {
            console.log('❌ FAILED! API Response:');
            console.log(JSON.stringify(expData, null, 2));
        }

    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
}

testProductionExperiences();
