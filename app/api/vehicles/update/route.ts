import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import * as admin from 'firebase-admin';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;
    
    const { vehicleId, name, model, registration } = await request.json();
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 });
    }

    await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .doc(vehicleId)
      .update({
        name,
        model,
        registration,
        updatedAt: admin.firestore.Timestamp.now()
      });

    return NextResponse.json({ message: 'Vehicle updated successfully' });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
