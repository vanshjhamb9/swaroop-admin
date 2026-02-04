// Complete test script for PhonePe API
// Tests: Login -> Get Token -> Initiate Payment

const API_BASE = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'customer1@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Customer123';

async function testPhonePeAPI() {
  try {
    console.log('=== PhonePe API Complete Test ===');
    console.log('API Base URL:', API_BASE);
    console.log('');

    // Step 1: Login to get Firebase token
    console.log('Step 1: Logging in to get Firebase token...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData.error || loginData);
      console.log('\nPlease check:');
      console.log('1. Server is running on', API_BASE);
      console.log('2. Test credentials are correct');
      console.log('3. Set TEST_EMAIL and TEST_PASSWORD environment variables if needed');
      return false;
    }

    const firebaseToken = loginData.data.idToken;
    console.log('✅ Login successful!');
    console.log('User:', loginData.data.user.email);
    console.log('Token length:', firebaseToken.length);
    console.log('');

    // Step 2: Test PhonePe Initiate API
    console.log('Step 2: Testing PhonePe payment initiation...');
    const paymentResponse = await fetch(`${API_BASE}/api/payment/phonepe/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': firebaseToken // Use X-Auth-Token header
      },
      body: JSON.stringify({
        amount: 100 // ₹100
      })
    });

    const paymentData = await paymentResponse.json();

    console.log('=== Payment API Response ===');
    console.log('Status:', paymentResponse.status, paymentResponse.statusText);
    console.log('Response:', JSON.stringify(paymentData, null, 2));
    console.log('');

    if (paymentResponse.ok && paymentData.success && paymentData.data?.paymentUrl) {
      console.log('✅ SUCCESS! PhonePe API is working correctly!');
      console.log('');
      console.log('Payment Details:');
      console.log('  Payment URL:', paymentData.data.paymentUrl);
      console.log('  Merchant Transaction ID:', paymentData.data.merchantTransactionId);
      console.log('  Amount: ₹', paymentData.data.amount);
      console.log('');
      console.log('🎉 All tests passed!');
      return true;
    } else {
      console.log('❌ Payment API Error:', paymentResponse.status);
      if (paymentData.error) {
        console.log('Error:', paymentData.error);
        console.log('Details:', paymentData.details);
      }
      return false;
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log('\n⚠️  Connection error. Please ensure:');
      console.log('1. Next.js dev server is running on', API_BASE);
      console.log('2. Server is accessible');
    }
    return false;
  }
}

// Run test
testPhonePeAPI()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
