import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helper';
import { adminFirestore } from '../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per request
    const startAfter = searchParams.get('startAfter') || null;
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDirection = searchParams.get('orderDirection') === 'asc' ? 'asc' : 'desc';

    let query = adminFirestore
      .collection('dealers')
      .orderBy(orderBy, orderDirection)
      .limit(limit)
      .select('name', 'email', 'contactDetails', 'createdAt');

    if (startAfter) {
      try {
        const startDoc = await adminFirestore.collection('dealers').doc(startAfter).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc);
        }
      } catch (err) {
        // If startAfter doc doesn't exist, ignore and continue without it
      }
    }

    // Parallelize main data fetch and total count estimate
    const [dealersSnapshotResult, countSnapshotResult] = await Promise.allSettled([
      query.get(),
      adminFirestore.collection('dealers').count().get()
    ]);

    let dealersSnapshot;

    if (dealersSnapshotResult.status === 'fulfilled') {
      dealersSnapshot = dealersSnapshotResult.value;
    } else {
      console.error('Error fetching dealers:', dealersSnapshotResult.reason);
      return NextResponse.json({
        success: true,
        data: {
          dealers: [],
          total: 0,
          limit,
          hasMore: false
        }
      });
    }

    const dealers = dealersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Use count result if available, otherwise just default to 0 (or dealers.length if small)
    let total = 0;
    if (countSnapshotResult.status === 'fulfilled') {
      total = countSnapshotResult.value.data().count;
    }

    const response = {
      success: true,
      data: {
        dealers,
        total,
        limit,
        hasMore: dealersSnapshot.size === limit,
        lastVisible: dealersSnapshot.docs.length > 0 ? dealersSnapshot.docs[dealersSnapshot.docs.length - 1].id : null
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error('Error in dealers API:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dealers' },
      { status: 500 }
    );
  }
}
