/**
 * Complete test script for PhonePe API
 * 
 * This script:
 * 1. Gets a fresh Firebase token
 * 2. Tests the PhonePe payment initiation API
 * 3. Shows the payment URL
 * 
 * Usage:
 *   node test-phonepe-api.js <email> <password> <amount>
 * 
 * Example:
 *   node test-phonepe-api.js customer1@gmail.com Customer123 100
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function testPhonePeAPI(email, password, amount = 100) {
  try {
    console.log('🧪 Testing PhonePe Payment API\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 1: Getting Firebase Token...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Login to get token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login failed!');
      console.error('Error:', loginData.error || loginData.message || 'Unknown error');
      process.exit(1);
    }

    if (!loginData.success || !loginData.data?.idToken) {
      console.error('❌ Token not found in login response!');
      console.error('Response:', JSON.stringify(loginData, null, 2));
      process.exit(1);
    }

    const token = loginData.data.idToken;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${loginData.data.user.email} (${loginData.data.user.role})`);
    console.log(`🔑 Token obtained (expires in 1 hour)\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 2: Testing PhonePe Payment API...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 2: Test PhonePe API
    const paymentResponse = await fetch(`${BASE_URL}/api/payment/phonepe/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
      }),
    });

    const paymentData = await paymentResponse.json();

    console.log(`📡 API Response Status: ${paymentResponse.status} ${paymentResponse.statusText}\n`);

    if (!paymentResponse.ok) {
      console.error('❌ Payment API failed!');
      console.error('Error:', paymentData.error || paymentData.message || 'Unknown error');
      if (paymentData.details) {
        console.error('Details:', paymentData.details);
      }
      process.exit(1);
    }

    if (paymentData.success && paymentData.data?.paymentUrl) {
      console.log('✅ Payment initiated successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 PAYMENT DETAILS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`💰 Amount: ₹${paymentData.data.amount}`);
      console.log(`🆔 Transaction ID: ${paymentData.data.merchantTransactionId}`);
      console.log(`🔗 Payment URL:`);
      console.log(`   ${paymentData.data.paymentUrl}\n`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('📝 Next Steps:');
      console.log('   1. Copy the Payment URL above');
      console.log('   2. Open it in your browser');
      console.log('   3. Complete payment using PhonePe test credentials');
      console.log('   4. Verify redirect to success page\n');
      
      return paymentData;
    } else {
      console.error('❌ Invalid response from payment API!');
      console.error('Response:', JSON.stringify(paymentData, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Your Next.js server is running (npm run dev)');
    console.error('   2. The server is running on port 5000');
    console.error('   3. You have internet connection');
    console.error('   4. PhonePe credentials are configured in .env.local');
    process.exit(1);
  }
}

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];
const amount = process.argv[4] || 100;

if (!email || !password) {
  console.error('❌ Missing required arguments!\n');
  console.log('Usage:');
  console.log('  node test-phonepe-api.js <email> <password> [amount]\n');
  console.log('Example:');
  console.log('  node test-phonepe-api.js customer1@gmail.com Customer123 100\n');
  console.log('Test Credentials:');
  console.log('  Customer: customer1@gmail.com / Customer123');
  console.log('  Admin: admin1@car360.com / Admin123');
  console.log('  Dealer: dealer1@car360.com / Dealer123\n');
  console.log('Note: Amount defaults to 100 if not specified\n');
  process.exit(1);
}

// Run the test
testPhonePeAPI(email, password, amount).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
