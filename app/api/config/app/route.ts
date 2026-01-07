import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../firebaseadmin';
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
    const config = await getAppConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found. Please contact support.' },
        { status: 500 }
      );
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





