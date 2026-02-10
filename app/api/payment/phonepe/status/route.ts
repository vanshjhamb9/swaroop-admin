import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '../../../firebaseadmin';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

// PhonePe Credentials - Support both test and production
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || 'M2303MNTS7JUM';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || 'c78d7749-d9f7-4f29-b165-f09ead02e7ae';
const PHONEPE_CLIENT_VERSION = parseInt(process.env.PHONEPE_CLIENT_VERSION || process.env.PHONEPE_SALT_INDEX || '1');
// Use SANDBOX for test, PRODUCTION for production (default to SANDBOX if not specified)
const PHONEPE_ENV = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantTransactionId = searchParams.get('merchantTransactionId');

        if (!merchantTransactionId) {
            return NextResponse.json(
                { error: 'Merchant Transaction ID is required' },
                { status: 400 }
            );
        }

        // Initialize PhonePe SDK client
        const phonePeClient = StandardCheckoutClient.getInstance(
            PHONEPE_CLIENT_ID,
            PHONEPE_CLIENT_SECRET,
            PHONEPE_CLIENT_VERSION,
            PHONEPE_ENV,
            false
        );

        // Check status via SDK
        console.log(`Checking status for: ${merchantTransactionId}`);
        const response = await phonePeClient.getOrderStatus(merchantTransactionId);
        console.log('PhonePe Status Response:', response);

        const paymentState = response.state;
        const phonePeTransactionId = response.orderId;

        // Get payment record from Firestore
        const paymentRef = adminFirestore.collection('payments').doc(merchantTransactionId);
        const paymentDoc = await paymentRef.get();

        if (!paymentDoc.exists) {
            return NextResponse.json(
                { error: 'Payment not found in our records' },
                { status: 404 }
            );
        }

        const paymentData = paymentDoc.data();
        const userId = paymentData?.userId;
        const amount = paymentData?.amount;
        const currentStatus = paymentData?.status;

        // If payment is successful in PhonePe but not yet updated in our DB
        if (paymentState === 'COMPLETED' && currentStatus !== 'success') {
            console.log(`Payment successful for ${merchantTransactionId}. Updating credits...`);

            // Update payment record
            await paymentRef.update({
                status: 'success',
                phonePeTransactionId: phonePeTransactionId,
                paymentDetails: JSON.parse(JSON.stringify(response)),
                completedAt: new Date().toISOString()
            });

            // Update user credits
            const userRef = adminFirestore.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const currentBalance = userDoc.data()?.creditBalance || 0;
                const newBalance = currentBalance + amount;

                const transactionDoc = {
                    id: `credit_${merchantTransactionId}`,
                    type: 'credit',
                    amount,
                    description: `Payment via PhonePe - ${phonePeTransactionId}`,
                    timestamp: new Date().toISOString(),
                    balanceAfter: newBalance,
                    metadata: {
                        paymentId: merchantTransactionId,
                        phonePeTransactionId: phonePeTransactionId
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

                // Trigger Invoice Generation (optional but good for consistency)
                try {
                    if (!paymentData?.invoiceGeneratedAt) {
                        const userData = userDoc.data();
                        const userName = userData?.name || 'Customer';
                        const userEmail = userData?.email || '';
                        const userPhone = userData?.phone || '';

                        const { generateAutoInvoice } = await import('@/lib/refrens-helper');

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
                            phonePeTransactionId: phonePeTransactionId
                        });
                    }
                } catch (invoiceError) {
                    console.error('Invoice generation failed:', invoiceError);
                }
            }
        } else if ((paymentState === 'FAILED' || paymentState === 'DECLINED') && currentStatus === 'pending') {
            await paymentRef.update({
                status: 'failed',
                paymentDetails: JSON.parse(JSON.stringify(response)),
                failedAt: new Date().toISOString()
            });
        }

        return NextResponse.json({
            success: true,
            status: paymentState === 'COMPLETED' ? 'success' : (paymentState === 'PENDING' ? 'pending' : 'failed'),
            data: {
                merchantTransactionId,
                amount,
                state: paymentState
            }
        });

    } catch (error: any) {
        console.error('Error checking PhonePe status:', error);
        return NextResponse.json(
            { error: 'Status check failed', details: error.message },
            { status: 500 }
        );
    }
}
