import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '../../../firebaseadmin';
import { createOrGetCustomer, generateInvoice, sendInvoice } from '../../../../../lib/zoho-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, paymentId, transactionId } = body;

    if (!userId || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || '';
    const userName = userData?.name || 'Customer';

    const customerId = await createOrGetCustomer(userEmail, userName);

    const invoiceId = await generateInvoice(
      customerId,
      amount,
      `Credit Purchase - ${amount} credits`,
      paymentId
    );

    await sendInvoice(invoiceId);

    await adminFirestore.collection('payments').doc(paymentId).update({
      zohoInvoiceId: invoiceId,
      invoiceGeneratedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        customerId
      }
    });
    
  } catch (error: any) {
    console.error('Error generating Zoho invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}
