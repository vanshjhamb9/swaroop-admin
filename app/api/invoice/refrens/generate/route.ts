import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../firebaseadmin';
import { createInvoice, RefrensInvoiceData } from '@/lib/refrens-helper';

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
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      invoiceTitle,
      currency = 'INR',
      sendEmail = true,
      userId,
      paymentId
    } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, items' },
        { status: 400 }
      );
    }

    const invoiceData: RefrensInvoiceData = {
      invoiceTitle: invoiceTitle || 'Tax Invoice',
      invoiceType: 'INVOICE',
      currency,
      billedTo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        street: customerAddress?.street,
        city: customerAddress?.city,
        pincode: customerAddress?.pincode,
        gstState: customerAddress?.gstState,
        gstin: customerAddress?.gstin,
        country: customerAddress?.country || 'IN'
      },
      items: items.map((item: any) => ({
        name: item.name,
        rate: item.rate,
        quantity: item.quantity || 1,
        gstRate: item.gstRate || 0
      })),
      contact: {
        email: customerEmail,
        phone: customerPhone
      }
    };

    if (sendEmail && customerEmail) {
      invoiceData.email = {
        to: {
          name: customerName,
          email: customerEmail
        }
      };
    }

    const invoice = await createInvoice(invoiceData);

    if (userId || paymentId) {
      const invoiceRecord = {
        refrensInvoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerName,
        customerEmail,
        amount: invoice.finalTotal?.total || 0,
        status: invoice.status,
        pdfLink: invoice.share?.pdf,
        viewLink: invoice.share?.link,
        createdAt: new Date().toISOString(),
        createdBy: decodedToken.uid,
        userId: userId || null,
        paymentId: paymentId || null
      };

      await adminFirestore.collection('refrens_invoices').doc(invoice._id).set(invoiceRecord);

      if (paymentId) {
        await adminFirestore.collection('payments').doc(paymentId).update({
          refrensInvoiceId: invoice._id,
          invoiceGeneratedAt: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        total: invoice.finalTotal?.total,
        pdfLink: invoice.share?.pdf,
        viewLink: invoice.share?.link
      }
    });

  } catch (error: any) {
    console.error('Error generating Refrens invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}
