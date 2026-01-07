import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;

    const vehiclesSnapshot = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .get();

    const vehicles = vehiclesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        model: data.model || '',
        registration: data.registration || '',
        images: data.images || [],
        imageCount: data.imageCount !== undefined ? data.imageCount : (data.images?.length || 0),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    return NextResponse.json({ vehicles });
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
