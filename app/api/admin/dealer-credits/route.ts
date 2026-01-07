import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';

/**
 * GET /api/admin/dealer-credits
 * Get credit balances and recent transactions for all dealers
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    // Fetch all dealers
    const dealersSnapshot = await adminFirestore.collection('dealers').get();
    
    const dealers = await Promise.all(
      dealersSnapshot.docs.map(async (dealerDoc) => {
        const dealerData = dealerDoc.data();
        const dealerId = dealerDoc.id;

        // Check if dealer has a user account (they might be in users collection)
        let creditBalance = 0;
        let recentTransactions: any[] = [];

        try {
          // Check users collection first (dealers might have user accounts)
          const userDoc = await adminFirestore.collection('users').doc(dealerId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            creditBalance = userData?.creditBalance || 0;

            // Fetch recent transactions
            const transactionsSnapshot = await adminFirestore
              .collection('users')
              .doc(dealerId)
              .collection('transactions')
              .orderBy('timestamp', 'desc')
              .limit(5)
              .get();

            recentTransactions = transactionsSnapshot.docs.map((txDoc) => {
              const txData = txDoc.data();
              return {
                id: txDoc.id,
                type: txData.type,
                amount: txData.amount,
                description: txData.description,
                timestamp: txData.timestamp,
              };
            });
          }
        } catch (err) {
          console.warn(`Error fetching credits for dealer ${dealerId}:`, err);
        }

        return {
          dealerId,
          name: dealerData.name || 'Unknown',
          email: dealerData.email || '',
          creditBalance,
          recentTransactions,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        dealers,
        total: dealers.length,
      },
    });

  } catch (error: any) {
    console.error('Error fetching dealer credits:', error);
    
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
      { error: 'Failed to fetch dealer credits', details: error.message },
      { status: 500 }
    );
  }
}

