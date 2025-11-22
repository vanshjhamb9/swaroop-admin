import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

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

    // Fetch all data in parallel with error handling
    let usersSnapshot, paymentsSnapshot, dealersSnapshot;
    try {
      usersSnapshot = await adminFirestore.collection('users').get();
    } catch (err) {
      console.warn('Users collection not found or inaccessible, using empty set');
      usersSnapshot = { size: 0, docs: [], forEach: () => {} } as any;
    }
    
    try {
      paymentsSnapshot = await adminFirestore.collection('payments').where('status', '==', 'success').get();
    } catch (err) {
      console.warn('Payments collection not found or inaccessible, using empty set');
      paymentsSnapshot = { size: 0, docs: [], forEach: () => {} } as any;
    }
    
    try {
      dealersSnapshot = await adminFirestore.collection('dealers').get();
    } catch (err) {
      console.warn('Dealers collection not found or inaccessible, using empty set');
      dealersSnapshot = { size: 0, docs: [] } as any;
    }

    const totalUsers = usersSnapshot.size;
    const totalDealers = dealersSnapshot.size;

    let totalRevenue = 0;
    const paymentsByDate: Record<string, number> = {};
    const transactionCount = paymentsSnapshot.size;

    paymentsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      totalRevenue += data.amount || 0;
      
      // Handle Firestore Timestamp
      let date: string;
      if (data.timestamp && data.timestamp.toDate) {
        date = data.timestamp.toDate().toISOString().split('T')[0];
      } else if (data.timestamp) {
        date = new Date(data.timestamp).toISOString().split('T')[0];
      } else {
        date = new Date().toISOString().split('T')[0];
      }
      
      paymentsByDate[date] = (paymentsByDate[date] || 0) + (data.amount || 0);
    });

    const revenueByDate = Object.entries(paymentsByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

    // Get top users by spending
    const topUsers: any[] = [];
    
    // Process users in batches to avoid overwhelming Firestore
    const userDocs = usersSnapshot.docs;
    
    for (const doc of userDocs) {
      const userId = doc.id;
      const userData = doc.data();
      
      try {
        const userTransactionsSnapshot = await adminFirestore
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .where('type', '==', 'debit')
          .get();

        let totalSpent = 0;
        userTransactionsSnapshot.forEach((txDoc: any) => {
          totalSpent += txDoc.data().amount || 0;
        });

        if (totalSpent > 0) {
          topUsers.push({
            userId,
            name: userData.name || 'Unknown',
            email: userData.email || '',
            totalSpent,
            transactionCount: userTransactionsSnapshot.size
          });
        }
      } catch (err) {
        console.error(`Error fetching transactions for user ${userId}:`, err);
        // Continue with other users
      }
    }

    topUsers.sort((a, b) => b.totalSpent - a.totalSpent);
    const top10Users = topUsers.slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDealers,
          totalRevenue,
          transactionCount
        },
        revenueByDate,
        topUsers: top10Users
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