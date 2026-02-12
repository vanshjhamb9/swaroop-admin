import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;
    
    const body = await request.json();
    const { name, model, registration, imageCount } = body;
    
    if (!name || !model || !registration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const vehicleRef = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .add({
        name,
        model,
        registration,
        experienceName: body.experienceName || '',
        images: body.images || [],
        imageCount: imageCount || 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });

    return NextResponse.json({
      id: vehicleRef.id,
      message: 'Vehicle created successfully'
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
