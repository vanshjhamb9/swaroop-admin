import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../firebaseadmin';
import { getInvoice } from '@/lib/refrens-helper';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const invoice = await getInvoice(invoiceId);

    return NextResponse.json({
      success: true,
      data: invoice
    });

  } catch (error: any) {
    console.error('Error getting Refrens invoice:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice', details: error.message },
      { status: 500 }
    );
  }
}
