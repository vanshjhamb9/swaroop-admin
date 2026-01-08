import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import * as admin from 'firebase-admin';

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

    // Get date filters from query params
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (startDateParam) {
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);
    }
    if (endDateParam) {
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    }

    // Check cache first (simple implementation - for production, use Redis or similar)
    // Note: In Next.js serverless functions, this cache will reset on each cold start
    // For production, use Redis or a proper caching service

    // Parallelize all independent fetches
    const [usersResult, dealersResult, paymentsResult] = await Promise.allSettled([
      // 1. Users Count
      adminFirestore.collection('users').count().get(),

      // 2. Dealers Count
      adminFirestore.collection('dealers').count().get(),

      // 3. Payments Query
      (async () => {
        let paymentsQuery: any = adminFirestore
          .collection('payments')
          .where('status', '==', 'success')
          .select('amount', 'timestamp', 'userId', 'userName', 'userEmail', 'status');

        // Apply date filters
        if (startDate && !endDate) {
          paymentsQuery = paymentsQuery
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
            .orderBy('timestamp', 'desc')
            .limit(1000);
        } else if (endDate && !startDate) {
          paymentsQuery = paymentsQuery
            .where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate))
            .orderBy('timestamp', 'desc')
            .limit(1000);
        } else {
          // Default to last 30 days for faster initial load
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          paymentsQuery = paymentsQuery
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
            .orderBy('timestamp', 'desc')
            .limit(1000);
        }

        const snapshot = await paymentsQuery.get();

        // Filter in memory if both dates provided (rare case for dashboard usage)
        if (startDate && endDate) {
          const filteredDocs = snapshot.docs.filter((doc: any) => {
            const data = doc.data();
            let timestamp: Date | null = null;
            if (data.timestamp?.toDate) {
              timestamp = data.timestamp.toDate();
            } else if (data.timestamp) {
              timestamp = new Date(data.timestamp);
            }
            return timestamp && timestamp >= startDate && timestamp <= endDate;
          });

          return {
            size: filteredDocs.length,
            docs: filteredDocs,
            forEach: (callback: any) => filteredDocs.forEach(callback),
          };
        }
        return snapshot;
      })()
    ]);

    // Process results
    let usersCount = usersResult.status === 'fulfilled' ? usersResult.value.data().count : 0;
    if (usersResult.status === 'rejected') console.warn('Users count failed');

    let dealersCount = dealersResult.status === 'fulfilled' ? dealersResult.value.data().count : 0;
    if (dealersResult.status === 'rejected') console.warn('Dealers count failed');

    let paymentsSnapshot = paymentsResult.status === 'fulfilled' ? paymentsResult.value : { size: 0, docs: [], forEach: () => { } };
    if (paymentsResult.status === 'rejected') console.warn('Payments fetch failed', paymentsResult.reason);

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

    // Optimized: Check if we have user details in payments (avoiding N+1 queries)
    const userDetailsMap: Record<string, { name: string; email: string }> = {};

    // Scan payments to find user details (opportunistic cache)
    paymentsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.userId && data.userName && data.userEmail) {
        if (!userDetailsMap[data.userId]) {
          userDetailsMap[data.userId] = {
            name: data.userName,
            email: data.userEmail
          };
        }
      }
    });

    // Fetch user details only for top spenders (batch fetch)
    const topUsers: any[] = [];
    if (topUserIds.length > 0) {
      // Identify users who need a DB fetch (not in cache)
      const missingUserIds = topUserIds.filter(id => !userDetailsMap[id]);
      const fetchedUsersMap: Record<string, { name: string; email: string }> = {};

      // Batch fetch missing users
      if (missingUserIds.length > 0) {
        try {
          const userRefs = missingUserIds.map(id => adminFirestore.collection('users').doc(id));
          const userSnapshots = await adminFirestore.getAll(...userRefs);

          userSnapshots.forEach(doc => {
            if (doc.exists) {
              const userData = doc.data();
              fetchedUsersMap[doc.id] = {
                name: userData?.name || 'Unknown',
                email: userData?.email || ''
              };
            }
          });
        } catch (err) {
          console.error('Error batch fetching users:', err);
        }
      }

      // Construct the final list
      topUsers.push(...topUserIds.map(userId => {
        const details = userDetailsMap[userId] || fetchedUsersMap[userId];
        if (details) {
          return {
            userId,
            name: details.name,
            email: details.email,
            totalSpent: userSpendingMap[userId].amount,
            transactionCount: userSpendingMap[userId].count
          };
        }
        return null; // Should not happen often if IDs exist
      }).filter(u => u !== null));
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