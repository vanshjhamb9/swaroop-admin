import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import { getAppConfig, calculateImageProcessingCredits } from '@/lib/config-helper';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/image/process
 * Process images with credit deduction based on configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { imageCount, processingType, imageUrls } = body;

    // Validate input
    if (!imageCount || imageCount <= 0) {
      return NextResponse.json(
        { error: 'imageCount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    if (!processingType || !['singleImage', 'multipleImages'].includes(processingType)) {
      return NextResponse.json(
        { error: 'processingType must be "singleImage" or "multipleImages"' },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'imageUrls is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (imageUrls.length !== imageCount) {
      return NextResponse.json(
        { error: 'imageUrls length must match imageCount' },
        { status: 400 }
      );
    }

    // Get configuration
    const config = await getAppConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if feature is enabled
    if (processingType === 'singleImage' && !config.features.singleImageEnabled) {
      return NextResponse.json(
        { error: 'Single image processing is currently disabled' },
        { status: 403 }
      );
    }

    if (processingType === 'multipleImages' && !config.features.multipleImagesEnabled) {
      return NextResponse.json(
        { error: 'Multiple images processing is currently disabled' },
        { status: 403 }
      );
    }

    // Calculate required credits
    let creditCalculation;
    try {
      creditCalculation = calculateImageProcessingCredits(
        config,
        imageCount,
        processingType
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const { credits, discountApplied, savings } = creditCalculation;

    // Check user balance
    const userRef = adminFirestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentBalance = userData?.creditBalance || 0;
    const planType = userData?.planType || 'prepaid';
    const newBalance = currentBalance - credits;

    // Check if user has sufficient credits
    if (planType === 'prepaid' && newBalance < 0) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          details: {
            currentBalance,
            requiredCredits: credits,
            shortfall: Math.abs(newBalance),
          },
        },
        { status: 400 }
      );
    }

    // Create transaction record
    const transactionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const transaction = {
      id: transactionId,
      type: 'debit',
      amount: credits,
      description: `Image processing: ${processingType} (${imageCount} image${imageCount > 1 ? 's' : ''})`,
      timestamp,
      balanceAfter: newBalance,
      metadata: {
        processingType,
        imageCount,
        discountApplied,
        savings: savings || null,
        originalCredits: creditCalculation.originalCredits || null,
      },
    };

    // Process in transaction
    await adminFirestore.runTransaction(async (t) => {
      // Deduct credits
      t.update(userRef, {
        creditBalance: newBalance,
        updatedAt: timestamp,
      });
      
      // Record transaction
      t.set(
        userRef.collection('transactions').doc(transactionId),
        transaction
      );

      // Create processing job record
      const jobRef = adminFirestore.collection('processingJobs').doc(transactionId);
      t.set(jobRef, {
        id: transactionId,
        userId,
        processingType,
        imageUrls,
        imageCount,
        status: 'pending',
        creditsDeducted: credits,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    // Return response with processing job details
    return NextResponse.json({
      success: true,
      data: {
        jobId: transactionId,
        creditsDeducted: credits,
        newBalance,
        discountApplied,
        savings: savings || null,
        transaction,
        message: 'Images queued for processing',
      },
    });

  } catch (error: any) {
    console.error('Error processing images:', error);
    
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { error: 'Token expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process images', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/image/process/estimate
 * Estimate credits required for processing without deducting
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const imageCount = parseInt(searchParams.get('imageCount') || '0');
    const processingType = searchParams.get('processingType');

    if (!imageCount || imageCount <= 0) {
      return NextResponse.json(
        { error: 'imageCount query parameter is required and must be greater than 0' },
        { status: 400 }
      );
    }

    if (!processingType || !['singleImage', 'multipleImages'].includes(processingType)) {
      return NextResponse.json(
        { error: 'processingType query parameter must be "singleImage" or "multipleImages"' },
        { status: 400 }
      );
    }

    // Get configuration
    const config = await getAppConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 500 }
      );
    }

    // Calculate credits
    let creditCalculation;
    try {
      creditCalculation = calculateImageProcessingCredits(
        config,
        imageCount,
        processingType as 'singleImage' | 'multipleImages'
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        imageCount,
        processingType,
        ...creditCalculation,
        rateInfo: processingType === 'singleImage' 
          ? config.creditRates.singleImage
          : config.creditRates.multipleImages,
      },
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    });

  } catch (error: any) {
    console.error('Error estimating credits:', error);
    
    return NextResponse.json(
      { error: 'Failed to estimate credits', details: error.message },
      { status: 500 }
    );
  }
}





