import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../../firebaseadmin';

/**
 * PUT /api/invoice/refrens/update-status
 * Update invoice payment status manually (for manual invoices only)
 * Requires admin authentication
 */
export async function PUT(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const body = await request.json();
    const { invoiceId, status, paymentLink } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['PAID', 'UNPAID', 'PARTIALLY_PAID', 'CANCELED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (PAID, UNPAID, PARTIALLY_PAID, CANCELED)' },
        { status: 400 }
      );
    }

    // Check if invoice exists in our database
    const invoiceRef = adminFirestore.collection('invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'Invoice not found in database' },
        { status: 404 }
      );
    }

    const invoiceData = invoiceDoc.data();
    
    // Check if this is a manual invoice (has manual flag or created via admin panel)
    if (!invoiceData?.isManual) {
      return NextResponse.json(
        { error: 'Only manual invoices can have their status updated via this endpoint' },
        { status: 403 }
      );
    }

    // Update invoice status
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid,
    };

    if (paymentLink) {
      updateData.paymentLink = paymentLink;
    }

    await invoiceRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: {
        invoiceId,
        status,
        paymentLink: paymentLink || invoiceData.paymentLink,
      },
    });

  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization header') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update invoice status', details: error.message },
      { status: 500 }
    );
  }
}



