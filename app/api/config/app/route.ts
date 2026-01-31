import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import { getAppConfig, compareVersions, checkAppUpdate } from '@/lib/config-helper';

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
    const appVersion = searchParams.get('appVersion');
    const platform = searchParams.get('platform');

    if (!appVersion || !platform) {
      return NextResponse.json(
        { error: 'appVersion and platform query parameters are required' },
        { status: 400 }
      );
    }

    if (platform !== 'ios' && platform !== 'android') {
      return NextResponse.json(
        { error: 'platform must be "ios" or "android"' },
        { status: 400 }
      );
    }

    // Get configuration from Firestore
    let config = await getAppConfig();

    // Auto-initialize default config if it doesn't exist
    if (!config) {
      console.log('Configuration not found, initializing default config...');
      
      const defaultConfig = {
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

      try {
        await adminFirestore.collection('appConfig').doc('current').set(defaultConfig);
        config = defaultConfig as any;
        console.log('Default configuration initialized successfully');
      } catch (initError) {
        console.error('Failed to initialize default config:', initError);
        return NextResponse.json(
          { error: 'Configuration not found and failed to initialize. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Check app update requirements
    const updateCheck = checkAppUpdate(
      appVersion,
      config.appUpdate.minimumVersion,
      config.appUpdate.latestVersion,
      config.appUpdate.forceUpdate
    );

    // Build response with dynamic update flags
    const response = {
      success: true,
      data: {
        version: config.version,
        timestamp: new Date().toISOString(),
        appUpdate: {
          isUpdateRequired: updateCheck.isUpdateRequired,
          minimumVersion: config.appUpdate.minimumVersion,
          latestVersion: config.appUpdate.latestVersion,
          forceUpdate: updateCheck.forceUpdate,
          updateMessage: config.appUpdate.updateMessage,
        },
        creditRates: {
          ...config.creditRates,
          video: config.creditRates.video || {
            credits: 50,
            description: 'Video processing',
          },
        },
        features: config.features,
        payments: config.payments,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('Error fetching app config:', error);
    
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { error: 'Token expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch configuration', details: error.message },
      { status: 500 }
    );
  }
}





