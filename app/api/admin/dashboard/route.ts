import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const [adminsSnapshot, dealersSnapshot, vehiclesSnapshot] = await Promise.all([
      adminFirestore.collection('admins').get(),
      adminFirestore.collection('dealers').get(),
      adminFirestore.collection('vehicles').get()
    ]);

    const totalAdmins = adminsSnapshot.size;
    const totalDealers = dealersSnapshot.size;
    const totalVehicles = vehiclesSnapshot.size;

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
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
