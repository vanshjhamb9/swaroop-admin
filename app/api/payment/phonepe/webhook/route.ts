import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '../../../firebaseadmin';
import crypto from 'crypto';

const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const xVerifyHeader = request.headers.get('X-VERIFY');
    
    if (!xVerifyHeader) {
      return NextResponse.json(
        { error: 'Missing X-VERIFY header' },
        { status: 400 }
      );
    }

    const base64Response = body.response;
    const decodedResponse = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(base64Response + PHONEPE_SALT_KEY)
      .digest('hex') + '###' + PHONEPE_SALT_INDEX;

    if (xVerifyHeader !== expectedChecksum) {
      console.error('Checksum verification failed');
      return NextResponse.json(
        { error: 'Invalid checksum' },
        { status: 400 }
      );
    }

    const merchantTransactionId = decodedResponse.data.merchantTransactionId;
    const transactionId = decodedResponse.data.transactionId;
    const paymentState = decodedResponse.code;

    const paymentRef = adminFirestore.collection('payments').doc(merchantTransactionId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();
    const userId = paymentData?.userId;
    const amount = paymentData?.amount;

    if (paymentState === 'PAYMENT_SUCCESS') {
      await paymentRef.update({
        status: 'success',
        phonePeTransactionId: transactionId,
        webhookData: decodedResponse,
        completedAt: new Date().toISOString()
      });

      const userRef = adminFirestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const currentBalance = userDoc.data()?.creditBalance || 0;
      const newBalance = currentBalance + amount;

      const transactionDoc = {
        id: `credit_${merchantTransactionId}`,
        type: 'credit',
        amount,
        description: `Payment via PhonePe - ${transactionId}`,
        timestamp: new Date().toISOString(),
        balanceAfter: newBalance,
        metadata: {
          paymentId: merchantTransactionId,
          phonePeTransactionId: transactionId
        }
      };

      await adminFirestore.runTransaction(async (t) => {
        t.update(userRef, {
          creditBalance: newBalance,
          updatedAt: new Date().toISOString()
        });
        
        t.set(
          userRef.collection('transactions').doc(transactionDoc.id),
          transactionDoc
        );
      });

      try {
        const userDoc = await adminFirestore.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const userName = userData?.name || 'Customer';
        const userEmail = userData?.email || '';
        const userPhone = userData?.phone || '';

        const { generateAutoInvoice } = await import('@/lib/refrens-helper');
        
        // Save user details to payment doc for analytics optimization
        await paymentRef.update({
          userName,
          userEmail
        });
        
        const refrensInvoice = await generateAutoInvoice(
          userName,
          userEmail,
          userPhone,
          amount,
          `Credit Purchase - ${amount} credits`,
          merchantTransactionId,
          true
        );

        await paymentRef.update({
          refrensInvoiceId: refrensInvoice._id,
          invoiceNumber: refrensInvoice.invoiceNumber,
          invoicePdfLink: refrensInvoice.share?.pdf,
          invoiceViewLink: refrensInvoice.share?.link,
          invoiceGeneratedAt: new Date().toISOString()
        });

        await adminFirestore.collection('refrens_invoices').doc(refrensInvoice._id).set({
          refrensInvoiceId: refrensInvoice._id,
          invoiceNumber: refrensInvoice.invoiceNumber,
          customerName: userName,
          customerEmail: userEmail,
          amount: refrensInvoice.finalTotal?.total || amount,
          status: refrensInvoice.status,
          pdfLink: refrensInvoice.share?.pdf,
          viewLink: refrensInvoice.share?.link,
          createdAt: new Date().toISOString(),
          userId,
          paymentId: merchantTransactionId,
          phonePeTransactionId: transactionId
        });

      } catch (invoiceError) {
        console.error('Refrens invoice generation failed:', invoiceError);
      }

      return NextResponse.json({ success: true });
      
    } else if (paymentState === 'PAYMENT_ERROR' || paymentState === 'PAYMENT_DECLINED') {
      await paymentRef.update({
        status: 'failed',
        webhookData: decodedResponse,
        failedAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, status: 'failed' });
    }

    return NextResponse.json({ success: true, status: 'unknown' });
    
  } catch (error: any) {
    console.error('PhonePe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
