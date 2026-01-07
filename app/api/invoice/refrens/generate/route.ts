import { NextRequest, NextResponse } from 'next/server';
import { createInvoice } from '@/lib/refrens-helper';
import { validateGSTIN } from '@/lib/gst-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      invoiceTitle,
      items,
      sendEmail,
      currency,
      ccEmails,
      paymentLink
    } = body;

    if (!customerName) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }

    const billedTo: any = {
      name: customerName,
      country: customerAddress?.country || 'IN'
    };

    if (customerEmail) billedTo.email = customerEmail;
    if (customerPhone) billedTo.phone = customerPhone;
    if (customerAddress?.street) billedTo.street = customerAddress.street;
    if (customerAddress?.city) billedTo.city = customerAddress.city;
    if (customerAddress?.pincode) billedTo.pincode = customerAddress.pincode;

    // Only add GST fields if GSTIN is provided
    if (customerAddress?.gstin && customerAddress.gstin.trim()) {
      const gstin = customerAddress.gstin.trim().toUpperCase();
      
      if (!validateGSTIN(gstin)) {
        return NextResponse.json(
          { success: false, error: 'Invalid GSTIN format. Example: 07AAAAA0000A1Z5' },
          { status: 400 }
        );
      }

      if (!customerAddress.gstState) {
        return NextResponse.json(
          { success: false, error: 'GST State Code is required when GSTIN is provided' },
          { status: 400 }
        );
      }

      billedTo.gstin = gstin;
      billedTo.gstState = customerAddress.gstState;
    }

    const invoiceData = {
      invoiceTitle: invoiceTitle || 'Tax Invoice',
      invoiceType: 'INVOICE' as const,
      currency: currency || 'INR',
      billedTo,
      items: items.map((item: any) => ({
        name: item.name,
        rate: parseFloat(item.rate),
        quantity: parseInt(item.quantity),
        gstRate: item.gstRate ? parseFloat(item.gstRate) : undefined
      }))
    };

    if (sendEmail && customerEmail) {
      const emailConfig: any = {
        to: {
          name: customerName,
          email: customerEmail
        }
      };

      // Handle CC emails - support comma or semicolon separated, or array
      if (ccEmails) {
        let ccArray: string[] = [];
        
        if (Array.isArray(ccEmails)) {
          ccArray = ccEmails.filter(email => email && email.trim());
        } else if (typeof ccEmails === 'string') {
          // Split by comma or semicolon
          ccArray = ccEmails.split(/[,;]/).map(email => email.trim()).filter(Boolean);
        }

        if (ccArray.length > 0) {
          emailConfig.cc = ccArray.map(email => ({ email }));
        }
      }

      invoiceData.email = emailConfig;
    }

    console.log('📄 Creating invoice:', JSON.stringify(invoiceData, null, 2));

    const invoice = await createInvoice(invoiceData);

    // Store invoice in database with payment link if provided
    if (paymentLink || invoice._id) {
      try {
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.split('Bearer ')[1];
          const { adminAuth, adminFirestore } = await import('../../../firebaseadmin');
          
          try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            
            await adminFirestore.collection('invoices').doc(invoice._id).set({
              invoiceId: invoice._id,
              refrensInvoiceId: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              status: invoice.status,
              amount: invoice.finalTotal?.total || 0,
              customerName,
              customerEmail,
              ccEmails: ccEmails || null,
              paymentLink: paymentLink || null,
              isManual: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: decodedToken.uid,
            }, { merge: true });
          } catch (err) {
            // If token verification fails, still continue with invoice creation
            console.warn('Could not save invoice to database:', err);
          }
        }
      } catch (err) {
        console.warn('Error saving invoice to database:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        paymentLink: paymentLink || null,
      }
    });

  } catch (error: any) {
    console.error('Error generating Refrens invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate invoice' 
      },
      { status: 500 }
    );
  }
}