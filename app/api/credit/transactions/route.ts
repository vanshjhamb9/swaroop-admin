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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactionsRef = adminFirestore
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    const snapshot = await transactionsRef.get();
    
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalCountSnapshot = await adminFirestore
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .count()
      .get();

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total: totalCountSnapshot.data().count,
        limit,
        offset
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    );
  }
}
