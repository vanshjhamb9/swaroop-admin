import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { userId, amount, description, paymentId } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid userId or amount' },
        { status: 400 }
      );
    }

    const isAdmin = decodedToken.admin === true;
    const isSelf = decodedToken.uid === userId;
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Unauthorized to add credits to this account' },
        { status: 403 }
      );
    }

    const userRef = adminFirestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentBalance = userData?.creditBalance || 0;
    const newBalance = currentBalance + amount;

    const transactionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const transaction = {
      id: transactionId,
      type: 'credit',
      amount,
      description: description || 'Credit added',
      timestamp,
      balanceAfter: newBalance,
      metadata: {
        paymentId: paymentId || null,
        addedBy: decodedToken.uid
      }
    };

    await adminFirestore.runTransaction(async (t) => {
      t.update(userRef, {
        creditBalance: newBalance,
        updatedAt: timestamp
      });
      
      t.set(
        userRef.collection('transactions').doc(transactionId),
        transaction
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionId,
        newBalance,
        transaction
      }
    });
    
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return NextResponse.json(
      { error: 'Failed to add credits', details: error.message },
      { status: 500 }
    );
  }
}
