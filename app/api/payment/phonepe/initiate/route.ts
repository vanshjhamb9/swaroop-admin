import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../firebaseadmin';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_API_URL = process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';

export async function POST(request: NextRequest) {
  try {
    // Validate PhonePe configuration
    if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
      console.error('PhonePe configuration missing:', {
        hasMerchantId: !!PHONEPE_MERCHANT_ID,
        hasSaltKey: !!PHONEPE_SALT_KEY
      });
      return NextResponse.json(
        { error: 'PhonePe payment gateway is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get authorization header - Next.js normalizes headers to lowercase
    let authHeader = request.headers.get('authorization');
    
    // If not found, try all possible variations
    if (!authHeader) {
      authHeader = request.headers.get('Authorization') || 
                   request.headers.get('AUTHORIZATION') ||
                   request.headers.get('authorization');
      
      // Log all headers for debugging
      const allHeaders: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        allHeaders[key] = value;
      });
      console.error('No authorization header found. Available headers:', allHeaders);
    }
    
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Missing authorization header',
          debug: 'Please ensure the Authorization header is set with Bearer token'
        },
        { status: 401 }
      );
    }

    // Normalize the header value
    const normalizedHeader = authHeader.trim();
    
    if (!normalizedHeader.toLowerCase().startsWith('bearer ')) {
      console.error('Authorization header format issue. Received:', normalizedHeader.substring(0, 50) + '...');
      return NextResponse.json(
        { 
          error: 'Invalid authorization header format',
          details: 'Header must start with "Bearer " (case-insensitive)',
          received: normalizedHeader.substring(0, 20) + '...'
        },
        { status: 401 }
      );
    }

    // Extract token - handle both "Bearer token" and "bearer token"
    const parts = normalizedHeader.split(/\s+/);
    if (parts.length < 2) {
      return NextResponse.json(
        { error: 'Token missing in authorization header' },
        { status: 401 }
      );
    }
    
    const token = parts.slice(1).join(' '); // Join in case token has spaces (shouldn't, but safe)

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError.message);
      if (tokenError.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { error: 'Token expired. Please login again to get a new token.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid token', details: tokenError.message },
        { status: 401 }
      );
    }
    
    const userId = decodedToken.uid;

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get base URL - use production URL if available, otherwise localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://urbanuplink.ai');

    const merchantTransactionId = `TXN_${uuidv4()}`;
    const amountInPaise = Math.round(amount * 100);

    const paymentPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userId,
      amount: amountInPaise,
      redirectUrl: `${baseUrl}/payment/success`,
      redirectMode: 'POST',
      callbackUrl: `${baseUrl}/api/payment/phonepe/webhook`,
      mobileNumber: decodedToken.phone_number || '',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const checksum = crypto
      .createHash('sha256')
      .update(base64Payload + '/pg/v1/pay' + PHONEPE_SALT_KEY)
      .digest('hex') + '###' + PHONEPE_SALT_INDEX;

    const paymentDoc = {
      id: merchantTransactionId,
      userId,
      amount,
      status: 'pending',
      paymentMethod: 'phonepe',
      phonePeMerchantTransactionId: merchantTransactionId,
      timestamp: new Date().toISOString(),
      payload: paymentPayload
    };

    await adminFirestore.collection('payments').doc(merchantTransactionId).set(paymentDoc);

    const response = await fetch(`${PHONEPE_API_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({ request: base64Payload })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      console.error('PhonePe API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });
      return NextResponse.json(
        { 
          error: 'Failed to initiate payment', 
          details: errorDetails?.message || `PhonePe API returned ${response.status}: ${response.statusText}`,
          statusCode: response.status
        },
        { status: 500 }
      );
    }

    const responseData = await response.json();

    if (responseData.success && responseData.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId,
          amount
        }
      });
    } else {
      console.error('PhonePe response error:', {
        success: responseData.success,
        code: responseData.code,
        message: responseData.message,
        fullResponse: responseData
      });
      return NextResponse.json(
        { 
          error: 'Failed to initiate payment', 
          details: responseData.message || responseData.code || 'Invalid response from PhonePe',
          code: responseData.code
        },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Error initiating PhonePe payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment', details: error.message },
      { status: 500 }
    );
  }
}
