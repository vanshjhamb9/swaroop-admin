import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../firebaseadmin';
import { v4 as uuidv4 } from 'uuid';
import { StandardCheckoutClient, StandardCheckoutPayRequest, Env } from 'pg-sdk-node';

// PhonePe Credentials - Support both test and production
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || 'M2303MNTS7JUM';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || 'c78d7749-d9f7-4f29-b165-f09ead02e7ae';
const PHONEPE_CLIENT_VERSION = parseInt(process.env.PHONEPE_CLIENT_VERSION || process.env.PHONEPE_SALT_INDEX || '1');
// Use SANDBOX for test, PRODUCTION for production (default to SANDBOX if not specified)
const PHONEPE_ENV = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

export async function POST(request: NextRequest) {
  try {
    // Validate PhonePe configuration
    if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
      console.error('PhonePe configuration missing:', {
        hasClientId: !!PHONEPE_CLIENT_ID,
        hasClientSecret: !!PHONEPE_CLIENT_SECRET
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

    // Initialize PhonePe SDK client using getInstance (singleton pattern)
    const phonePeClient = StandardCheckoutClient.getInstance(
      PHONEPE_CLIENT_ID,
      PHONEPE_CLIENT_SECRET,
      PHONEPE_CLIENT_VERSION,
      PHONEPE_ENV,
      false // shouldPublishEvents - set to false
    );

    // Create payment request using SDK
    // Ensure redirect URL is a publicly accessible URL (not localhost)
    const redirectUrl = `${baseUrl}/payment/status?merchantTransactionId=${merchantTransactionId}`;
    
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:250',message:'Building payment request',data:{merchantTransactionId,amountInPaise,redirectUrl,baseUrl,environment:PHONEPE_ENV===Env.PRODUCTION?'production':'sandbox'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Log the redirect URL for debugging
    console.log('PhonePe Payment Request:', {
      merchantTransactionId,
      amount: amountInPaise,
      redirectUrl,
      baseUrl,
      environment: PHONEPE_ENV === Env.PRODUCTION ? 'production' : 'sandbox',
      clientId: PHONEPE_CLIENT_ID.substring(0, 10) + '...', // Log partial ID for debugging
      envVar: process.env.PHONEPE_ENV || 'not set (defaults to SANDBOX)'
    });
    
    const payRequest = new StandardCheckoutPayRequest(
      merchantTransactionId,
      amountInPaise,
      undefined, // metaInfo
      undefined, // message
      redirectUrl // redirectUrl - must be publicly accessible
    );
    
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:268',message:'Payment request created',data:{merchantOrderId:payRequest.merchantOrderId,amount:payRequest.amount,hasPaymentFlow:!!payRequest.paymentFlow,paymentFlowType:payRequest.paymentFlow?.type,merchantUrlsRedirectUrl:payRequest.paymentFlow?.merchantUrls?.redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Verify the request structure
    console.log('Payment Request Structure:', {
      merchantOrderId: payRequest.merchantOrderId,
      amount: payRequest.amount,
      paymentFlow: payRequest.paymentFlow ? {
        type: payRequest.paymentFlow.type,
        merchantUrls: payRequest.paymentFlow.merchantUrls
      } : 'missing'
    });

    // Save payment record to Firestore
    const paymentDoc = {
      id: merchantTransactionId,
      userId,
      amount,
      status: 'pending',
      paymentMethod: 'phonepe',
      phonePeMerchantTransactionId: merchantTransactionId,
      timestamp: new Date().toISOString(),
      environment: PHONEPE_ENV === Env.PRODUCTION ? 'production' : 'sandbox'
    };

    await adminFirestore.collection('payments').doc(merchantTransactionId).set(paymentDoc);

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:292',message:'Calling PhonePe SDK pay()',data:{merchantTransactionId,amountInPaise,redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Initiate payment using SDK
    const payResponse = await phonePeClient.pay(payRequest);

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:297',message:'PhonePe SDK response received',data:{hasResponse:!!payResponse,hasRedirectUrl:!!payResponse?.redirectUrl,redirectUrl:payResponse?.redirectUrl,responseKeys:payResponse?Object.keys(payResponse):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // SDK returns StandardCheckoutPayResponse with redirectUrl
    if (payResponse && payResponse.redirectUrl) {
      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: payResponse.redirectUrl,
          merchantTransactionId,
          amount
        }
      });
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:310',message:'PhonePe SDK response missing redirectUrl',data:{response:payResponse,responseType:typeof payResponse,responseString:JSON.stringify(payResponse)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      console.error('PhonePe SDK response error:', {
        response: payResponse
      });
      return NextResponse.json(
        { 
          error: 'Failed to initiate payment', 
          details: 'Invalid response from PhonePe SDK - redirectUrl missing',
          response: payResponse
        },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c21d75a-8c3c-43ac-ba02-55c861c8b40a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'phonepe/initiate:325',message:'Exception in payment initiation',data:{error:error.message,stack:error.stack,errorType:error.constructor.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    console.error('Error initiating PhonePe payment:', {
      error: error.message,
      stack: error.stack,
      environment: PHONEPE_ENV === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX',
      clientIdPrefix: PHONEPE_CLIENT_ID.substring(0, 15),
      envVar: process.env.PHONEPE_ENV || 'not set'
    });
    
    // Provide helpful error message for "Client Not Found"
    if (error.message?.includes('Client Not Found') || error.message?.includes('Not Found')) {
      return NextResponse.json(
        { 
          error: 'Failed to initiate payment', 
          details: error.message,
          hint: PHONEPE_ENV === Env.PRODUCTION 
            ? 'Production credentials not found. Check if PHONEPE_ENV=PRODUCTION matches your credentials, or use SANDBOX mode for testing.'
            : 'SANDBOX credentials not found. Verify PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET are set correctly.',
          environment: PHONEPE_ENV === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to initiate payment', details: error.message },
      { status: 500 }
    );
  }
}
