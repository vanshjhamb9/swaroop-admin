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
      currency
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
      (invoiceData as any).email = {
        to: {
          name: customerName,
          email: customerEmail
        }
      };
    }

    console.log('📄 Creating invoice:', JSON.stringify(invoiceData, null, 2));

    const invoice = await createInvoice(invoiceData);

    return NextResponse.json({
      success: true,
      data: invoice
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