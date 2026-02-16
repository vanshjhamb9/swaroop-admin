/**
 * Helper script to get Firebase ID token for API testing
 * 
 * Usage:
 *   node get-firebase-token.js <email> <password>
 * 
 * Example:
 *   node get-firebase-token.js customer1@gmail.com Customer123
 */

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBsz7bMlHbAt320x0-IS4ZopZEzW-B70RY';

// Support both localhost and production
// Check for --prod flag or BASE_URL env variable
const isProduction = process.argv.includes('--prod');
const BASE_URL = process.env.BASE_URL || 
                 (isProduction ? 'https://urbanuplink.ai' : 'http://localhost:5000');

async function getFirebaseToken(email, password) {
  try {
    const envType = BASE_URL.includes('urbanuplink.ai') ? 'PRODUCTION' : 'LOCALHOST';
    console.log('🔐 Logging in to get Firebase token...');
    console.log(`🌍 Environment: ${envType}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🌐 API URL: ${BASE_URL}/api/auth/login\n`);

    // Call your login API
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Login failed!');
      console.error('Error:', data.error || data.message || 'Unknown error');
      process.exit(1);
    }

    if (data.success && data.data && data.data.idToken) {
      const token = data.data.idToken;
      
      console.log('✅ Login successful!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 YOUR FIREBASE TOKEN (copy this):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(token);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('👤 User Info:');
      console.log(`   UID: ${data.data.user.uid}`);
      console.log(`   Email: ${data.data.user.email}`);
      console.log(`   Role: ${data.data.user.role}\n`);
      
      console.log('📝 How to use in Postman:');
      console.log('   1. Open your PhonePe API request');
      console.log('   2. Go to Headers tab');
      console.log('   3. Set header: X-Auth-Token');
      console.log('   4. Set value: [paste token above]\n');
      
      console.log('⏰ Token expires in 1 hour. Run this script again to get a fresh token.\n');
      
      return token;
    } else {
      console.error('❌ Token not found in response!');
      console.error('Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Your Next.js server is running (npm run dev)');
    console.error('   2. The server URL is correct');
    console.error('   3. You have internet connection');
    process.exit(1);
  }
}

// Get command line arguments (filter out --prod flag)
const args = process.argv.slice(2).filter(arg => arg !== '--prod');
const email = args[0];
const password = args[1];

if (!email || !password) {
  console.error('❌ Missing arguments!\n');
  console.log('Usage:');
  console.log('  node get-firebase-token.js <email> <password> [--prod]\n');
  console.log('Examples:');
  console.log('  # Localhost (default):');
  console.log('  node get-firebase-token.js customer1@gmail.com Customer123\n');
  console.log('  # Production:');
  console.log('  node get-firebase-token.js customer1@gmail.com Customer123 --prod');
  console.log('  Or: BASE_URL=https://urbanuplink.ai node get-firebase-token.js customer1@gmail.com Customer123\n');
  console.log('Test Credentials (from TEST_CREDENTIALS.md):');
  console.log('  Customer: customer1@gmail.com / Customer123');
  console.log('  Admin: admin1@car360.com / Admin123');
  console.log('  Dealer: dealer1@car360.com / Dealer123\n');
  process.exit(1);
}

// Run the function
getFirebaseToken(email, password).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
