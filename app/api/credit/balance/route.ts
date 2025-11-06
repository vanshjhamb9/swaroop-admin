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
    const userId = decodedToken.uid;

    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      const defaultData = {
        userId,
        planType: 'prepaid',
        creditBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await adminFirestore.collection('users').doc(userId).set(defaultData, { merge: true });
      
      return NextResponse.json({
        success: true,
        data: defaultData
      });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        planType: userData?.planType || 'prepaid',
        creditBalance: userData?.creditBalance || 0,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit balance', details: error.message },
      { status: 500 }
    );
  }
}
