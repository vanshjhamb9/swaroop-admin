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

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const startAfterId = searchParams.get('startAfter') || null;

    let dealersQuery = adminFirestore.collection('dealers')
      .orderBy('name')
      .limit(limit)
      .select('name', 'email');

    if (startAfterId) {
      const startAfterDoc = await adminFirestore.collection('dealers').doc(startAfterId).get();
      if (startAfterDoc.exists) {
        dealersQuery = dealersQuery.startAfter(startAfterDoc);
      }
    }

    const dealersSnapshot = await dealersQuery.get();

    // Optimization: Batch fetch all user docs to avoid N+1 queries
    const dealerIds = dealersSnapshot.docs.map(doc => doc.id);
    const userDocsMap: Record<string, any> = {};

    if (dealerIds.length > 0) {
      try {
        const userRefs = dealerIds.map(id => adminFirestore.collection('users').doc(id));
        const userSnapshots = await adminFirestore.getAll(...userRefs);

        userSnapshots.forEach(doc => {
          if (doc.exists) {
            userDocsMap[doc.id] = doc.data();
          }
        });
      } catch (err) {
        console.error('Error batch fetching users for dealers:', err);
      }
    }

    const dealers = await Promise.all(
      dealersSnapshot.docs.map(async (dealerDoc) => {
        const dealerData = dealerDoc.data();
        const dealerId = dealerDoc.id;

        // Check if dealer has a user account (they might be in users collection)
        let creditBalance = 0;
        let recentTransactions: any[] = [];

        try {
          // Optimization: Use batched user data instead of individual get()
          const userData = userDocsMap[dealerId];

          if (userData) {
            creditBalance = userData?.creditBalance || 0;

            // Fetch recent transactions
            // Optimized: Fetch only the latest 1 since that's all the UI needs right now
            const transactionsSnapshot = await adminFirestore
              .collection('users')
              .doc(dealerId)
              .collection('transactions')
              .orderBy('timestamp', 'desc')
              .limit(1)
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

    const lastVisible = dealersSnapshot.docs[dealersSnapshot.docs.length - 1];

    return NextResponse.json({
      success: true,
      data: {
        dealers,
        total: dealers.length, // returning count of this page
        lastVisible: lastVisible ? lastVisible.id : null,
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

