import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const [adminsSnapshot, dealersSnapshot] = await Promise.all([
      adminFirestore.collection('admins').get(),
      adminFirestore.collection('dealers').get()
    ]);

    const totalAdmins = adminsSnapshot.size;
    const totalDealers = dealersSnapshot.size;

    let totalVehicles = 0;
    for (const dealerDoc of dealersSnapshot.docs) {
      const vehiclesSnapshot = await adminFirestore
        .collection('dealers')
        .doc(dealerDoc.id)
        .collection('vehicles')
        .get();
      totalVehicles += vehiclesSnapshot.size;
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
    console.error('Error fetching dashboard data:', error);
    
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
