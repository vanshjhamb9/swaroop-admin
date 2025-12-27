import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

// Cache TTL constant (for future Redis implementation)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check cache first (simple implementation - for production, use Redis or similar)
    // Note: In Next.js serverless functions, this cache will reset on each cold start
    // For production, use Redis or a proper caching service

    // Fetch counts using count() queries - much faster than fetching all docs
    let usersCount = 0, dealersCount = 0, paymentsSnapshot;
    
    try {
      const usersCountSnapshot = await adminFirestore.collection('users').count().get();
      usersCount = usersCountSnapshot.data().count;
    } catch (err) {
      console.warn('Users collection not accessible');
    }
    
    try {
      const dealersCountSnapshot = await adminFirestore.collection('dealers').count().get();
      dealersCount = dealersCountSnapshot.data().count;
    } catch (err) {
      console.warn('Dealers collection not accessible');
    }
    
    try {
      // Only fetch successful payments - limit to last 1000 for performance
      paymentsSnapshot = await adminFirestore
        .collection('payments')
        .where('status', '==', 'success')
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();
    } catch (err) {
      console.warn('Payments collection not accessible');
      paymentsSnapshot = { size: 0, docs: [], forEach: () => {} } as any;
    }

    const transactionCount = paymentsSnapshot.size;

    let totalRevenue = 0;
    const paymentsByDate: Record<string, number> = {};

    // Process payments efficiently
    paymentsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      const amount = data.amount || 0;
      totalRevenue += amount;
      
      // Handle Firestore Timestamp
      let date: string;
      if (data.timestamp && data.timestamp.toDate) {
        date = data.timestamp.toDate().toISOString().split('T')[0];
      } else if (data.timestamp) {
        date = new Date(data.timestamp).toISOString().split('T')[0];
      } else {
        date = new Date().toISOString().split('T')[0];
      }
      
      paymentsByDate[date] = (paymentsByDate[date] || 0) + amount;
    });

    const revenueByDate = Object.entries(paymentsByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Optimized top users: Calculate from payments instead of individual transaction queries
    // This eliminates N+1 queries by using the payments collection directly
    const userSpendingMap: Record<string, { amount: number; count: number }> = {};
    
    paymentsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      const userId = data.userId;
      if (userId) {
        if (!userSpendingMap[userId]) {
          userSpendingMap[userId] = { amount: 0, count: 0 };
        }
        userSpendingMap[userId].amount += data.amount || 0;
        userSpendingMap[userId].count += 1;
      }
    });

    // Get top 20 user IDs by spending
    const topUserIds = Object.entries(userSpendingMap)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 20)
      .map(([userId]) => userId);

    // Fetch user details only for top spenders (batch fetch)
    const topUsers: any[] = [];
    if (topUserIds.length > 0) {
      const userPromises = topUserIds.map(async (userId) => {
        try {
          const userDoc = await adminFirestore.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            return {
              userId,
              name: userData?.name || 'Unknown',
              email: userData?.email || '',
              totalSpent: userSpendingMap[userId].amount,
              transactionCount: userSpendingMap[userId].count
            };
          }
          return null;
        } catch (err) {
          return null;
        }
      });

      const userResults = await Promise.all(userPromises);
      topUsers.push(...userResults.filter(u => u !== null));
    }

    // Sort again to ensure correct order after async operations
    topUsers.sort((a, b) => b.totalSpent - a.totalSpent);
    const top10Users = topUsers.slice(0, 10);

    const response = {
      success: true,
      data: {
        overview: {
          totalUsers: usersCount,
          totalDealers: dealersCount,
          totalRevenue,
          transactionCount
        },
        revenueByDate,
        topUsers: top10Users
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}