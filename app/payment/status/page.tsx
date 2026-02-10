'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function StatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const merchantTransactionId = searchParams.get('merchantTransactionId');

    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
    const [details, setDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!merchantTransactionId) {
            setStatus('failed');
            setError('Missing transaction ID');
            return;
        }

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/payment/phonepe/status?merchantTransactionId=${merchantTransactionId}`);
                const data = await response.json();

                if (data.success) {
                    setStatus(data.status);
                    setDetails(data.data);
                } else {
                    setStatus('failed');
                    setError(data.error || 'Failed to verify payment status');
                }
            } catch (err) {
                console.error('Error checking status:', err);
                setStatus('failed');
                setError('An error occurred while verifying your payment');
            }
        };

        // Check immediately
        checkStatus();

        // If pending, check again every 5 seconds for up to 30 seconds
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            if (status === 'pending' && attempts < 6) {
                await checkStatus();
            } else if (attempts >= 6 || status !== 'pending') {
                clearInterval(interval);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [merchantTransactionId]);

    return (
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center border border-gray-100">
            {status === 'loading' && (
                <div className="py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
                    <p className="text-gray-500">Please wait while we confirm your transaction with PhonePe...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
                        <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-8 px-4">
                        Your credits have been updated. You can now use them to search for leads and export data.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction ID</span>
                            <span className="font-mono font-medium text-gray-900">{merchantTransactionId?.substring(0, 15)}...</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-bold text-gray-900">₹{details?.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                Completed
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:bg-gray-800 transform transition active:scale-95"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            )}

            {status === 'failed' && (
                <div className="py-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-8 px-4">
                        {error || 'We couldn\'t verify your payment. If money was deducted, it will be refunded or updated shortly.'}
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/credits/add"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:bg-blue-700 transform transition active:scale-95"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-white border border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            {status === 'pending' && (
                <div className="py-12">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50">
                            <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Pending</h1>
                        <p className="text-gray-600 mb-8">
                            We are still waiting for confirmation from the bank. This usually takes a few seconds.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Status
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-sans">
            <Suspense fallback={
                <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-12 text-center border border-gray-100">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    <p className="text-gray-500">Loading payment details...</p>
                </div>
            }>
                <StatusContent />
            </Suspense>
        </main>
    );
}
