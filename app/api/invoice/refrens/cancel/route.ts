import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../firebaseadmin';
import { cancelInvoice } from '@/lib/refrens-helper';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const invoice = await cancelInvoice(invoiceId);

    const invoiceDoc = await adminFirestore.collection('refrens_invoices').doc(invoiceId).get();
    if (invoiceDoc.exists) {
      await adminFirestore.collection('refrens_invoices').doc(invoiceId).update({
        status: 'CANCELED',
        canceledAt: new Date().toISOString(),
        canceledBy: decodedToken.uid
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status
      }
    });

  } catch (error: any) {
    console.error('Error canceling Refrens invoice:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invoice', details: error.message },
      { status: 500 }
    );
  }
}
