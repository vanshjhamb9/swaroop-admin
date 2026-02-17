const fetch = require('node-fetch');

const BASE_URL = 'https://www.urbanuplink.ai/api/experiences/list';
// Use a dummy token structure that looks somewhat real but is invalid
const BAD_TOKENS = {
    'String "undefined"': 'undefined',
    'String "null"': 'null',
    'Empty String': '',
    'Random text': 'not-a-jwt',
    'Bearer only': undefined, // Will test logic
    'Quotes': '"some-token"',
    'Truncated JWT': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
};

async function testToken(name, tokenValue) {
    console.log(`Testing with ${name}...`);
    try {
        const headers = {};
        if (tokenValue !== undefined) {
            headers['Authorization'] = `Bearer ${tokenValue}`;
        }

        const response = await fetch(BASE_URL, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();

        console.log(`Status: ${response.status}`);
        if (data.details && data.details.includes('Decoding Firebase ID token failed')) {
            console.log('>>> MATCH FOUND! This input produces the error.');
        } else {
            console.log('Error message:', data.error || data.message || JSON.stringify(data));
        }
        console.log('---');
    } catch (e) {
        console.error('Request failed:', e.message);
    }
}

async function run() {
    console.log('Diagnosing Production Error...');
    for (const [name, value] of Object.entries(BAD_TOKENS)) {
        await testToken(name, value);
    }
}

run();
