/**
 * Diagnostic script to check PhonePe configuration
 * 
 * Usage:
 *   node diagnose-phonepe-config.js
 */

const PRODUCTION_URL = 'https://urbanuplink.ai';

async function diagnoseConfig() {
  console.log('🔍 Diagnosing PhonePe Configuration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Test 1: Check if API is accessible
  console.log('Test 1: Checking API accessibility...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/payment/phonepe/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': 'test-token',
      },
      body: JSON.stringify({ amount: 100 }),
    });
    
    const data = await response.json();
    
    if (data.error?.includes('configured')) {
      console.log('❌ PhonePe not configured - Missing environment variables\n');
    } else if (data.error?.includes('Token')) {
      console.log('✅ API is accessible (token error is expected)\n');
    } else {
      console.log(`📡 API Response: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ API not accessible: ${error.message}\n`);
  }
  
  // Test 2: Get actual error with valid token
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test 2: Testing with valid token...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Getting production token...');
  const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'customer1@gmail.com',
      password: 'Customer123',
    }),
  });
  
  const loginData = await loginResponse.json();
  
  if (!loginData.success || !loginData.data?.idToken) {
    console.error('❌ Failed to get token');
    process.exit(1);
  }
  
  const token = loginData.data.idToken;
  console.log('✅ Token obtained\n');
  
  console.log('Testing PhonePe API...');
  const paymentResponse = await fetch(`${PRODUCTION_URL}/api/payment/phonepe/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({ amount: 100 }),
  });
  
  const paymentData = await paymentResponse.json();
  
  console.log(`\n📡 Response Status: ${paymentResponse.status}`);
  console.log(`📋 Response Data:`, JSON.stringify(paymentData, null, 2));
  
  // Analyze the error
  if (paymentData.error?.includes('Client Not Found')) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 DIAGNOSIS: Client Not Found Error');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Possible Causes:');
    console.log('1. ❌ PHONEPE_ENV is set to PRODUCTION but production credentials are invalid');
    console.log('2. ❌ Production credentials not activated in PhonePe dashboard');
    console.log('3. ❌ Wrong credentials configured in Vercel');
    console.log('4. ❌ PhonePe account not approved for production\n');
    
    console.log('💡 Solutions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Option 1: Use SANDBOX mode (for testing)');
    console.log('   - In Vercel: Remove or set PHONEPE_ENV to anything except PRODUCTION');
    console.log('   - Use SANDBOX credentials:');
    console.log('     PHONEPE_CLIENT_ID=M2303MNTS7JUM_2602011428');
    console.log('     PHONEPE_CLIENT_SECRET=ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj\n');
    
    console.log('Option 2: Fix Production credentials');
    console.log('   - Verify credentials in PhonePe Dashboard');
    console.log('   - Ensure account is activated for production');
    console.log('   - Check if credentials match exactly\n');
    
    console.log('Option 3: Check Vercel Environment Variables');
    console.log('   - Go to Vercel Dashboard → Settings → Environment Variables');
    console.log('   - Verify:');
    console.log('     PHONEPE_CLIENT_ID = M2303MNTS7JUM');
    console.log('     PHONEPE_CLIENT_SECRET = c78d7749-d9f7-4f29-b165-f09ead02e7ae');
    console.log('     PHONEPE_ENV = PRODUCTION (only if using production)\n');
  } else if (paymentData.success) {
    console.log('\n✅ SUCCESS! Payment API is working correctly\n');
  }
}

diagnoseConfig().catch(console.error);
