// Test PhonePe API with Test Credentials
const crypto = require('crypto');

// Test credentials - PhonePe Test Keys
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_TEST_MERCHANT_ID || 'M2303MNTS7JUM_2602011428';
const PHONEPE_SALT_KEY = process.env.PHONEPE_TEST_SALT_KEY || 'ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_TEST_SALT_INDEX || '1';
// Test/Sandbox API URL - PhonePe UAT/Test environment
// Based on PhonePe docs: https://api.phonepe.com/apis/pg for test/UAT
const PHONEPE_API_URL = process.env.PHONEPE_TEST_API_URL || 'https://api.phonepe.com/apis/pg';

console.log('=== PhonePe Test API Test ===');
console.log('Merchant ID:', PHONEPE_MERCHANT_ID);
console.log('Salt Key:', PHONEPE_SALT_KEY.substring(0, 20) + '...');
console.log('Salt Index:', PHONEPE_SALT_INDEX);
console.log('API URL:', PHONEPE_API_URL);
console.log('');

// Credentials are set, proceed with test

// Test payload
const testPayload = {
  merchantId: PHONEPE_MERCHANT_ID,
  merchantTransactionId: 'TEST_' + Date.now(),
  merchantUserId: 'test_user_123',
  amount: 10000, // 100 INR in paise
  redirectUrl: 'https://urbanuplink.ai/payment/success',
  redirectMode: 'POST',
  callbackUrl: 'https://urbanuplink.ai/api/payment/phonepe/webhook',
  mobileNumber: '9999999999',
  paymentInstrument: {
    type: 'PAY_PAGE'
  }
};

const base64Payload = Buffer.from(JSON.stringify(testPayload)).toString('base64');
// Checksum string should match the endpoint path
const checksumString = base64Payload + '/v1/pay' + PHONEPE_SALT_KEY;
const checksum = crypto
  .createHash('sha256')
  .update(checksumString)
  .digest('hex') + '###' + PHONEPE_SALT_INDEX;

console.log('=== Request Details ===');
console.log('Payload:', JSON.stringify(testPayload, null, 2));
console.log('Base64 Length:', base64Payload.length);
console.log('Checksum (first 30 chars):', checksum.substring(0, 30) + '...');
console.log('');

// PhonePe API endpoint - the base URL already includes /apis/pg, so we just add /v1/pay
// Try different endpoint formats
const testUrls = [
  { url: `${PHONEPE_API_URL}/v1/pay`, checksumPath: '/v1/pay' },
  { url: `${PHONEPE_API_URL}/pg/v1/pay`, checksumPath: '/pg/v1/pay' },
  { url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', checksumPath: '/pg/v1/pay' },
  { url: 'https://mercury-uat.phonepe.com/v4/pg/payment', checksumPath: '/v4/pg/payment' },
];

async function testUrl(testConfig) {
  const { url, checksumPath } = testConfig;
  const checksumString = base64Payload + checksumPath + PHONEPE_SALT_KEY;
  const checksum = crypto
    .createHash('sha256')
    .update(checksumString)
    .digest('hex') + '###' + PHONEPE_SALT_INDEX;

  console.log(`\nTesting URL: ${url}`);
  console.log(`Checksum path: ${checksumPath}`);

  try {
    const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-VERIFY': checksum,
    'Accept': 'application/json'
  },
      body: JSON.stringify({ request: base64Payload })
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    console.log(`  Status: ${response.status} ${response.statusText}`);
    if (response.ok && responseData?.success) {
      console.log('  ✅ SUCCESS!');
      console.log('  Response:', JSON.stringify(responseData, null, 2));
      if (responseData.data?.instrumentResponse?.redirectInfo?.url) {
        console.log('  Payment URL:', responseData.data.instrumentResponse.redirectInfo.url);
      }
      return true;
    } else {
      console.log(`  ❌ Error: ${response.status}`);
      if (responseData.message) {
        console.log(`  Message: ${responseData.message}`);
      }
      if (responseData.code) {
        console.log(`  Code: ${responseData.code}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Request Failed: ${error.message}`);
    return false;
  }
}

// Test all URLs sequentially
(async () => {
  for (const testConfig of testUrls) {
    const success = await testUrl(testConfig);
    if (success) {
      console.log('\n✅ Found working endpoint!');
      process.exit(0);
    }
  }
  console.log('\n❌ None of the endpoints worked. Please check:');
  console.log('  1. Merchant ID format is correct');
  console.log('  2. Salt Key is correct');
  console.log('  3. Merchant account is activated in PhonePe dashboard');
  console.log('  4. API endpoint URL from PhonePe dashboard');
  process.exit(1);
})();
