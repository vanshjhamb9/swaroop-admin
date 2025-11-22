import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    let adminsSnapshot, dealersSnapshot;
    
    try {
      adminsSnapshot = await adminFirestore.collection('admins').get();
    } catch (err) {
      console.warn('Admins collection not accessible, using empty set');
      adminsSnapshot = { size: 0, docs: [] } as any;
    }
    
    try {
      dealersSnapshot = await adminFirestore.collection('dealers').get();
    } catch (err) {
      console.warn('Dealers collection not accessible, using empty set');
      dealersSnapshot = { size: 0, docs: [] } as any;
    }

    const totalAdmins = adminsSnapshot.size || 0;
    const totalDealers = dealersSnapshot.size || 0;

    let totalVehicles = 0;
    if (dealersSnapshot.docs && Array.isArray(dealersSnapshot.docs)) {
      for (const dealerDoc of dealersSnapshot.docs) {
        try {
          const vehiclesSnapshot = await adminFirestore
            .collection('dealers')
            .doc(dealerDoc.id)
            .collection('vehicles')
            .get();
          totalVehicles += vehiclesSnapshot.size;
        } catch (err) {
          console.warn(`Could not fetch vehicles for dealer ${dealerDoc.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAdmins,
        totalDealers,
        totalVehicles
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
