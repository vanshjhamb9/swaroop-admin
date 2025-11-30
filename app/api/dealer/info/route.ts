import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

/**
 * Simple endpoint to fetch dealer info from Firestore
 * Uses Admin SDK which bypasses security rules
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;

    // Use admin SDK to read dealer document directly
    const dealerDoc = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .get();

    if (!dealerDoc.exists()) {
      // Return basic info if doc doesn't exist
      return NextResponse.json({
        uid: dealerId,
        email: decodedToken.email || '',
        name: 'Dealer',
        contactDetails: '',
        vehicles: [],
      });
    }

    const data = dealerDoc.data();
    return NextResponse.json({
      uid: dealerId,
      email: decodedToken.email || '',
      name: data?.name || 'Dealer',
      contactDetails: data?.contactDetails || '',
      vehicles: data?.vehicles || [],
    });
  } catch (error: any) {
    console.error('Error fetching dealer info:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
