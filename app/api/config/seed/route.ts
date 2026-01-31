import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';
import { AppConfig } from '@/lib/config-helper';

/**
 * POST /api/config/seed
 * Seed initial app configuration (admin only)
 * This endpoint creates the default configuration if it doesn't exist
 */
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const configRef = adminFirestore.collection('appConfig').doc('current');
    const existingConfig = await configRef.get();

    if (existingConfig.exists) {
      return NextResponse.json({
        success: true,
        message: 'Configuration already exists. Use PUT /api/config/manage to update.',
        data: existingConfig.data()
      });
    }

    const defaultConfig: AppConfig = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      appUpdate: {
        isUpdateRequired: false,
        minimumVersion: '1.0.4',
        latestVersion: '1.0.4',
        forceUpdate: false,
        updateMessage: 'New features available! Update now.',
      },
      creditRates: {
        singleImage: {
          credits: 10,
          description: 'Background removal + AI background',
        },
        multipleImages: {
          creditsPerImage: 8,
          minimumImages: 8,
          maximumImages: 24,
          bulkDiscount: {
            enabled: true,
            threshold: 12,
            discountedRate: 7,
          },
        },
        video: {
          credits: 50,
          description: 'Video processing',
        },
      },
      features: {
        singleImageEnabled: true,
        multipleImagesEnabled: true,
        maxUploadSizeMB: 10,
      },
      payments: {
        rechargeOptions: [
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
          {
            credits: 1000,
            price: 849,
            currency: 'INR',
            savings: 150,
          },
        ],
      },
    };

    await configRef.set(defaultConfig);

    return NextResponse.json({
      success: true,
      message: 'Configuration seeded successfully',
      data: defaultConfig
    });

  } catch (error: any) {
    console.error('Error seeding config:', error);
    
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
      { error: 'Failed to seed configuration', details: error.message },
      { status: 500 }
    );
  }
}
