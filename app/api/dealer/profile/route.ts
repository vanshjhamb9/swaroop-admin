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

    // Fetch dealer data from Firestore using admin SDK
    const dealerDoc = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .get();

    if (!dealerDoc.exists()) {
      return NextResponse.json(
        { error: 'Dealer profile not found' },
        { status: 404 }
      );
    }

    const dealerData = dealerDoc.data();
    
    return NextResponse.json({
      uid: dealerId,
      email: decodedToken.email || '',
      name: dealerData?.name || '',
      contactDetails: dealerData?.contactDetails || '',
      vehicles: dealerData?.vehicles || [],
    });
  } catch (error: any) {
    console.error('Error fetching dealer profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
