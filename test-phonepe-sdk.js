// Test PhonePe API using Official SDK
const {
  StandardCheckoutClient,
  CredentialConfigBuilder,
  Env,
  CreateSdkOrderRequest,
  StandardCheckoutPayRequest,
  MerchantUrls,
  PgCheckoutPaymentFlow
} = require('pg-sdk-node');

// Test credentials
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_TEST_MERCHANT_ID || 'M2303MNTS7JUM_2602011428';
const PHONEPE_SALT_KEY = process.env.PHONEPE_TEST_SALT_KEY || 'ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_TEST_SALT_INDEX || '1';

console.log('=== PhonePe SDK Test ===');
console.log('Merchant ID:', PHONEPE_MERCHANT_ID);
console.log('Salt Key:', PHONEPE_SALT_KEY.substring(0, 20) + '...');
console.log('Salt Index:', PHONEPE_SALT_INDEX);
console.log('');

async function testPhonePeSDK() {
  try {
    console.log('✅ Credentials configured');
    console.log('');

    // Initialize client - Pass individual parameters, not CredentialConfig object
    // StandardCheckoutClient(clientId, clientSecret, clientVersion, env, shouldPublishEvents)
    const client = new StandardCheckoutClient(
      PHONEPE_MERCHANT_ID,
      PHONEPE_SALT_KEY,
      parseInt(PHONEPE_SALT_INDEX),
      Env.SANDBOX,
      false // shouldPublishEvents - set to false for testing
    );
    console.log('✅ Client initialized with SANDBOX environment');
    console.log('');

    // Create order request
    const merchantTransactionId = `TEST_${Date.now()}`;
    const amount = 10000; // 100 INR in paise

    const merchantUrls = new MerchantUrls('https://urbanuplink.ai/payment/success');
    merchantUrls.callbackUrl = 'https://urbanuplink.ai/api/payment/phonepe/webhook';

    const createOrderRequest = new CreateSdkOrderRequest();
    createOrderRequest.merchantOrderId = merchantTransactionId;
    createOrderRequest.amount = amount;
    // Add paymentFlow - required field
    const paymentFlow = new PgCheckoutPaymentFlow();
    paymentFlow.redirectUrl = 'https://urbanuplink.ai/payment/success';
    createOrderRequest.paymentFlow = paymentFlow;

    console.log('=== Creating Order ===');
    console.log('Merchant Transaction ID:', merchantTransactionId);
    console.log('Amount:', amount, 'paise (₹100)');
    console.log('Making request...\n');

    // Create order using createSdkOrder method
    const createOrderResponse = await client.createSdkOrder(createOrderRequest);

    console.log('=== Response ===');
    console.log('Response type:', createOrderResponse.constructor.name);
    console.log('Response:', JSON.stringify(createOrderResponse, null, 2));
    console.log('Response properties:', Object.keys(createOrderResponse));

    // Check response - createSdkOrder returns order details, not payment URL
    if (createOrderResponse.orderId && createOrderResponse.state) {
      console.log('\n✅ SUCCESS! PhonePe Test API is working correctly!');
      console.log('Order ID:', createOrderResponse.orderId);
      console.log('State:', createOrderResponse.state);
      console.log('Token:', createOrderResponse.token.substring(0, 50) + '...');
      console.log('\nNote: createSdkOrder creates an order. To get payment URL, use the pay() method with StandardCheckoutPayRequest.');
      return true;
    } else {
      console.log('\n⚠️ Unexpected response structure');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    return false;
  }
}

// Run test
testPhonePeSDK()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
