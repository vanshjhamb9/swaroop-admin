import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helper';
import { adminFirestore } from '../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);

    let dealersSnapshot;
    try {
      dealersSnapshot = await adminFirestore.collection('dealers').get();
    } catch (err) {
      console.error('Error fetching dealers:', err);
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const dealers: any[] = [];
    
    if (dealersSnapshot.docs && Array.isArray(dealersSnapshot.docs)) {
      dealersSnapshot.forEach((doc) => {
        dealers.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: dealers
    });
  } catch (error: any) {
    console.error('Error in dealers API:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dealers' },
      { status: 500 }
    );
  }
}
