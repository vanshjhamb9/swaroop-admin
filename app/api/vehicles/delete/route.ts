import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;
    
    const { vehicleId } = await request.json();
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 });
    }

    await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .doc(vehicleId)
      .delete();

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
