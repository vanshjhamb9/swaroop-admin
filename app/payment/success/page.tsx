import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Payment Successful
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Thank you for your payment. Your credits will be updated shortly. You can
          safely close this tab or go back to the app.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
          >
            Back to Dashboard
          </Link>
          <p className="text-xs text-gray-400">
            If your credits are not updated within a few minutes, please contact
            support with your transaction ID.
          </p>
        </div>
      </div>
    </main>
  );
}

