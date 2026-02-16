/**
 * Production API Testing Script
 * 
 * Tests the PhonePe payment API on production
 * 
 * Usage:
 *   node test-production-api.js <email> <password> <amount>
 * 
 * Example:
 *   node test-production-api.js customer1@gmail.com Customer123 100
 */

const PRODUCTION_URL = 'https://urbanuplink.ai';

async function testProductionAPI(email, password, amount = 100) {
  try {
    console.log('🌐 Testing PhonePe API on PRODUCTION\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 1: Getting Production Token...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Login to get token
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
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
      console.error('\n💡 Make sure:');
      console.error('   1. User exists in production Firebase');
      console.error('   2. Credentials are correct');
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
    console.log(`🌐 Production URL: ${PRODUCTION_URL}/api/payment/phonepe/initiate`);
    console.log(`💰 Amount: ₹${amount}\n`);

    // Step 2: Test PhonePe API
    const paymentResponse = await fetch(`${PRODUCTION_URL}/api/payment/phonepe/initiate`, {
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
      console.error('❌ Payment API failed!\n');
      console.error('Error:', paymentData.error || paymentData.message || 'Unknown error');
      if (paymentData.details) {
        console.error('Details:', paymentData.details);
      }
      
      console.error('\n💡 Common Issues:');
      if (paymentData.error?.includes('expired')) {
        console.error('   - Token expired: Get a fresh token');
      } else if (paymentData.error?.includes('configured')) {
        console.error('   - PhonePe not configured: Check Vercel environment variables');
        console.error('   - Required: PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_ENV=PRODUCTION');
      } else if (paymentData.error?.includes('Invalid amount')) {
        console.error('   - Invalid amount: Must be greater than 0');
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
      
      // Check if it's production or sandbox URL
      const isProduction = paymentData.data.paymentUrl.includes('mercury.phonepe.com');
      const isSandbox = paymentData.data.paymentUrl.includes('mercury-uat.phonepe.com');
      
      if (isSandbox) {
        console.log('⚠️  WARNING: Payment URL is SANDBOX (test mode)');
        console.log('   This means PHONEPE_ENV is not set to PRODUCTION in Vercel!\n');
        console.log('   Fix: Set PHONEPE_ENV=PRODUCTION in Vercel environment variables\n');
      } else if (isProduction) {
        console.log('✅ Payment URL is PRODUCTION mode - Correct!\n');
      }
      
      console.log('📝 Next Steps:');
      console.log('   1. Copy the Payment URL above');
      console.log('   2. Open it in your browser');
      console.log('   3. Complete payment (use real payment method in production)');
      console.log('   4. Verify redirect to: https://urbanuplink.ai/payment/success\n');
      
      return paymentData;
    } else {
      console.error('❌ Invalid response from payment API!');
      console.error('Response:', JSON.stringify(paymentData, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Production URL is accessible');
    console.error('   2. You have internet connection');
    console.error('   3. Production environment variables are configured');
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
  console.log('  node test-production-api.js <email> <password> [amount]\n');
  console.log('Example:');
  console.log('  node test-production-api.js customer1@gmail.com Customer123 100\n');
  console.log('Note: Amount defaults to 100 if not specified\n');
  process.exit(1);
}

// Run the test
testProductionAPI(email, password, amount).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
