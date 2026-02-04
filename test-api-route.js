// Test the PhonePe initiate API route
// Make sure your Next.js dev server is running on port 5000

const testFirebaseToken = process.env.TEST_FIREBASE_TOKEN || 'YOUR_FIREBASE_TOKEN_HERE';
const apiUrl = process.env.API_URL || 'http://localhost:5000/api/payment/phonepe/initiate';

if (testFirebaseToken === 'YOUR_FIREBASE_TOKEN_HERE') {
  console.error('❌ Please set TEST_FIREBASE_TOKEN environment variable');
  console.log('Usage: TEST_FIREBASE_TOKEN=your_token node test-api-route.js');
  process.exit(1);
}

async function testAPI() {
  try {
    console.log('=== Testing PhonePe Initiate API ===');
    console.log('API URL:', apiUrl);
    console.log('');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': testFirebaseToken // Use X-Auth-Token header (works with Vercel)
      },
      body: JSON.stringify({
        amount: 100 // ₹100
      })
    });

    const responseData = await response.json();

    console.log('=== Response ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    console.log('');

    if (response.ok && responseData.success && responseData.data?.paymentUrl) {
      console.log('✅ SUCCESS! API is working correctly!');
      console.log('Payment URL:', responseData.data.paymentUrl);
      console.log('Merchant Transaction ID:', responseData.data.merchantTransactionId);
      return true;
    } else {
      console.log('❌ API Error:', response.status);
      if (responseData.error) {
        console.log('Error:', responseData.error);
        console.log('Details:', responseData.details);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Request Failed:', error.message);
    return false;
  }
}

testAPI()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
