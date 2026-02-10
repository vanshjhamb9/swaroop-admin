// Test script for PhonePe Status API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';
const DUMMY_TXN_ID = 'TEST_STATUS_CHECK_' + Date.now();

async function testStatusAPI() {
    console.log('=== Testing PhonePe Status API ===');
    console.log('Endpoint:', `${API_BASE}/api/payment/phonepe/status?merchantTransactionId=${DUMMY_TXN_ID}`);

    try {
        const response = await fetch(`${API_BASE}/api/payment/phonepe/status?merchantTransactionId=${DUMMY_TXN_ID}`);
        const data = await response.json();

        console.log('Status Code:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.status === 404) {
            console.log('✅ Correctly returned 404 for non-existent transaction');
        } else {
            console.log('⚠️ Unexpected status code');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

testStatusAPI();
