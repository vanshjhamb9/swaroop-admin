import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    // Use Promise.allSettled to parallelize independent count operations
    const [adminsResult, dealersResult, vehiclesResult] = await Promise.allSettled([
      // 1. Total Admins
      adminFirestore.collection('admins').count().get(),

      // 2. Total Dealers
      adminFirestore.collection('dealers').count().get(),

      // 3. Total Vehicles (Optimized using Collection Group Query)
      // This counts all documents in any 'vehicles' subcollection across the entire database
      // It requires no custom index for simple counting and is significantly faster than looping
      adminFirestore.collectionGroup('vehicles').count().get()
    ]);

    // Process results
    let totalAdmins = 0;
    if (adminsResult.status === 'fulfilled') {
      totalAdmins = adminsResult.value.data().count;
    } else {
      console.warn('Admins count failed:', adminsResult.reason);
    }

    let totalDealers = 0;
    if (dealersResult.status === 'fulfilled') {
      totalDealers = dealersResult.value.data().count;
    } else {
      console.warn('Dealers count failed:', dealersResult.reason);
    }

    let totalVehicles = 0;
    if (vehiclesResult.status === 'fulfilled') {
      totalVehicles = vehiclesResult.value.data().count;
    } else {
      console.warn('Vehicles count failed (checking fallback):', vehiclesResult.reason);

      // Fallback: If collectionGroup fails (e.g. permission/index), try the slow batch method
      // significantly reduced limit to prevent hanging
      try {
        const dealersSnapshot = await adminFirestore.collection('dealers').limit(50).get();
        const counts = await Promise.all(
          dealersSnapshot.docs.map(doc =>
            doc.ref.collection('vehicles').count().get()
              .then(snap => snap.data().count)
              .catch(() => 0)
          )
        );
        totalVehicles = counts.reduce((a, b) => a + b, 0);
      } catch (e) {
        console.warn('Fallback vehicle count also failed');
      }
    }

    const response = {
      success: true,
      data: {
        totalAdmins,
        totalDealers,
        totalVehicles
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard data:', error instanceof Error ? error.message : String(error));

    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error.message === 'Missing or invalid authorization header') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
