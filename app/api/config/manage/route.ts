import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';
import { AppConfig } from '@/lib/config-helper';

/**
 * GET /api/config/manage
 * Get current configuration (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const configDoc = await adminFirestore
      .collection('appConfig')
      .doc('current')
      .get();

    if (!configDoc.exists) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const config = configDoc.data();

    return NextResponse.json({
      success: true,
      data: config,
    });

  } catch (error: any) {
    console.error('Error fetching config:', error);
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization header') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch configuration', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/manage
 * Update configuration (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const body = await request.json();
    
    // Validate required fields
    if (!body.creditRates || !body.appUpdate || !body.features) {
      return NextResponse.json(
        { error: 'Missing required fields: creditRates, appUpdate, features' },
        { status: 400 }
      );
    }

    // Validate credit rates structure
    if (
      !body.creditRates.singleImage?.credits ||
      !body.creditRates.multipleImages?.creditsPerImage ||
      !body.creditRates.multipleImages?.minimumImages ||
      !body.creditRates.multipleImages?.maximumImages
    ) {
      return NextResponse.json(
        { error: 'Invalid creditRates structure' },
        { status: 400 }
      );
    }

    // Validate app update structure
    if (
      !body.appUpdate.minimumVersion ||
      !body.appUpdate.latestVersion ||
      typeof body.appUpdate.forceUpdate !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Invalid appUpdate structure' },
        { status: 400 }
      );
    }

    // Prepare configuration object
    const config: AppConfig = {
      version: body.version || '1.0',
      timestamp: new Date().toISOString(),
      appUpdate: {
        isUpdateRequired: false, // Will be calculated dynamically
        minimumVersion: body.appUpdate.minimumVersion,
        latestVersion: body.appUpdate.latestVersion,
        forceUpdate: body.appUpdate.forceUpdate || false,
        updateMessage: body.appUpdate.updateMessage || 'New features available! Update now.',
      },
      creditRates: {
        singleImage: {
          credits: Number(body.creditRates.singleImage.credits),
          description: body.creditRates.singleImage.description || 'Background removal + AI background',
        },
        multipleImages: {
          creditsPerImage: Number(body.creditRates.multipleImages.creditsPerImage),
          minimumImages: Number(body.creditRates.multipleImages.minimumImages),
          maximumImages: Number(body.creditRates.multipleImages.maximumImages),
          bulkDiscount: {
            enabled: body.creditRates.multipleImages.bulkDiscount?.enabled || false,
            threshold: Number(body.creditRates.multipleImages.bulkDiscount?.threshold || 12),
            discountedRate: Number(body.creditRates.multipleImages.bulkDiscount?.discountedRate || 7),
          },
        },
        video: body.creditRates.video ? {
          credits: Number(body.creditRates.video.credits),
          description: body.creditRates.video.description || 'Video processing',
        } : {
          credits: 50,
          description: 'Video processing',
        },
        video: body.creditRates.video ? {
          credits: Number(body.creditRates.video.credits),
          description: body.creditRates.video.description || 'Video processing',
        } : {
          credits: 50,
          description: 'Video processing',
        },
      },
      features: {
        singleImageEnabled: body.features.singleImageEnabled !== false,
        multipleImagesEnabled: body.features.multipleImagesEnabled !== false,
        maxUploadSizeMB: Number(body.features.maxUploadSizeMB || 10),
      },
      payments: {
        rechargeOptions: body.payments?.rechargeOptions || [
          {
            credits: 100,
            price: 99,
            currency: 'INR',
          },
          {
            credits: 500,
            price: 449,
            currency: 'INR',
            savings: 50,
          },
        ],
      },
    };

    // Save to Firestore with history
    const batch = adminFirestore.batch();
    
    // Save current config
    const currentRef = adminFirestore.collection('appConfig').doc('current');
    batch.set(currentRef, config);

    // Save to history (with timestamp)
    const historyRef = adminFirestore.collection('appConfig').doc(`history_${Date.now()}`);
    batch.set(historyRef, {
      ...config,
      updatedBy: decodedToken.uid,
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config,
    });

  } catch (error: any) {
    console.error('Error updating config:', error);
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization header') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update configuration', details: error.message },
      { status: 500 }
    );
  }
}





