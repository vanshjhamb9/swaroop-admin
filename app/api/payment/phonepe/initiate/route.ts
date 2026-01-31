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

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:25',message:'Starting token extraction',data:{hasStandardAuth:!!request.headers.get('authorization'),hasVercelHeaders:!!request.headers.get('x-vercel-sc-headers')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion
    
    // Get authorization header - Next.js normalizes headers to lowercase
    // Try standard header first (this is what Postman sends)
    const standardAuth = request.headers.get('authorization') || 
                         request.headers.get('Authorization') || 
                         request.headers.get('AUTHORIZATION');
    
    // Also check for custom header (workaround for Vercel stripping Authorization)
    // Vercel strips the Authorization header, so we use X-Auth-Token as alternative
    const customAuth = request.headers.get('x-auth-token') || 
                       request.headers.get('X-Auth-Token') ||
                       request.headers.get('X-AUTH-TOKEN');
    
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:38',message:'Auth header check',data:{hasStandard:!!standardAuth,hasCustom:!!customAuth,customLength:customAuth?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Use standard auth if found, otherwise use custom header (X-Auth-Token)
    // If custom auth is provided, it should be the token without "Bearer " prefix
    let authHeader = standardAuth;
    if (!authHeader && customAuth) {
      // If custom auth already starts with "Bearer ", use as-is, otherwise add it
      authHeader = customAuth.startsWith('Bearer ') ? customAuth : `Bearer ${customAuth}`;
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:47',message:'Using X-Auth-Token header',data:{tokenLength:customAuth.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    
    // If not found in standard headers, check Vercel's special header
    // BUT: Only use it if it looks like a Firebase token (starts with eyJ)
    // Vercel tokens don't have the 'kid' claim, so we need to filter them out
    if (!authHeader) {
      const vercelHeaders = request.headers.get('x-vercel-sc-headers');
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:40',message:'Checking Vercel headers',data:{hasVercelHeaders:!!vercelHeaders,length:vercelHeaders?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
      
      if (vercelHeaders) {
        try {
          const parsedHeaders = JSON.parse(vercelHeaders);
          const extractedAuth = parsedHeaders.Authorization || parsedHeaders.authorization;
          
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:55',message:'Extracted from Vercel headers',data:{found:!!extractedAuth,startsWithBearer:extractedAuth?.startsWith('Bearer '),tokenPrefix:extractedAuth?.split(' ')[1]?.substring(0,50)||'none',fullTokenLength:extractedAuth?.split(' ')[1]?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
          // #endregion
          
          // Log all keys in parsed headers to see what's available
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:60',message:'Vercel headers keys',data:{keys:Object.keys(parsedHeaders)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          // Only use if it looks like a Firebase token (JWT tokens start with 'eyJ')
          // Vercel tokens might be different, so check the format
          if (extractedAuth && extractedAuth.startsWith('Bearer ')) {
            const potentialToken = extractedAuth.split(' ')[1];
            const tokenParts = potentialToken?.split('.') || [];
            const isJWTFormat = potentialToken && potentialToken.startsWith('eyJ') && tokenParts.length === 3;
            
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:56',message:'Token format validation',data:{isJWTFormat,partsCount:tokenParts.length,firstPartPrefix:tokenParts[0]?.substring(0,20)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            // Firebase ID tokens are JWTs that start with 'eyJ' and have 3 parts separated by '.'
            if (isJWTFormat) {
              // Decode JWT header to check for 'kid' claim
              try {
                const headerPart = tokenParts[0];
                // JWT uses base64url encoding (URL-safe base64)
                const base64 = headerPart.replace(/-/g, '+').replace(/_/g, '/');
                const padding = '='.repeat((4 - base64.length % 4) % 4);
                const decodedHeader = JSON.parse(Buffer.from(base64 + padding, 'base64').toString());
                
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:66',message:'JWT header decoded',data:{hasKid:!!decodedHeader.kid,alg:decodedHeader.alg,typ:decodedHeader.typ},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                // Only use if it has 'kid' claim (Firebase tokens have this, Vercel tokens don't)
                if (decodedHeader.kid) {
                  authHeader = extractedAuth;
                  
                  // #region agent log
                  fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:74',message:'Using token from Vercel headers (has kid)',data:{tokenLength:potentialToken.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  // #endregion
                } else {
                  // #region agent log
                  fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:79',message:'Rejecting token (no kid claim)',data:{reason:'No kid claim in JWT header'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  // #endregion
                }
              } catch (decodeError: any) {
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:85',message:'Failed to decode JWT header',data:{error:decodeError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
              }
            } else {
              // #region agent log
              fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:90',message:'Token does not match JWT format',data:{reason:'Not eyJ or wrong part count'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
            }
          }
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:96',message:'Failed to parse Vercel headers',data:{error:(e as Error).message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          console.error('Failed to parse x-vercel-sc-headers:', e);
        }
      }
    }
    
    if (!authHeader) {
      // Log all headers for debugging (truncate sensitive values)
      const allHeaders: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('vercel') || key.toLowerCase().includes('forwarded')) {
          allHeaders[key] = value.length > 200 ? value.substring(0, 200) + '...' : value;
        }
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:130',message:'No auth header found - all relevant headers',data:allHeaders,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
      
      console.error('No authorization header found. Relevant headers:', allHeaders);
      
      return NextResponse.json(
        { 
          error: 'Missing authorization header',
          debug: 'Vercel is stripping the Authorization header. The header you send is being replaced with a Vercel token.',
          solution: 'Use header "X-Auth-Token" in Postman instead of "Authorization". Value: YOUR_FIREBASE_TOKEN (without "Bearer " prefix)',
          alternative: 'Or configure Vercel to pass through Authorization headers in vercel.json'
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

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:130',message:'Before token verification',data:{tokenLength:token.length,tokenPrefix:token.substring(0,30),partsCount:token.split('.').length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:137',message:'Token verification success',data:{userId:decodedToken.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (tokenError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:142',message:'Token verification failed',data:{error:tokenError.message,code:tokenError.code,hasKidError:tokenError.message.includes('kid')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
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
