import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, requireAdmin } from '@/lib/auth-helper';
import { adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    // Use count() queries instead of fetching all documents - much faster
    let totalAdmins = 0, totalDealers = 0, totalVehicles = 0;
    
    try {
      const adminsCountSnapshot = await adminFirestore.collection('admins').count().get();
      totalAdmins = adminsCountSnapshot.data().count;
    } catch (err) {
      console.warn('Admins collection not accessible');
    }
    
    try {
      const dealersCountSnapshot = await adminFirestore.collection('dealers').count().get();
      totalDealers = dealersCountSnapshot.data().count;
    } catch (err) {
      console.warn('Dealers collection not accessible');
    }

    // For vehicle count, use a more efficient approach:
    // Option 1: Store vehicle count in dealers document (recommended for production)
    // Option 2: Use collection group query (if vehicles have consistent structure)
    // Option 3: Batch fetch with limit (current optimized approach)
    try {
      // Fetch only dealer IDs for batch processing
      const dealersSnapshot = await adminFirestore.collection('dealers')
        .limit(100) // Limit to prevent timeout on large datasets
        .get();

      // Process vehicle counts in parallel batches
      const batchSize = 10;
      const dealerDocs = dealersSnapshot.docs;
      
      for (let i = 0; i < dealerDocs.length; i += batchSize) {
        const batch = dealerDocs.slice(i, i + batchSize);
        const batchPromises = batch.map(async (dealerDoc) => {
          try {
            const vehiclesSnapshot = await adminFirestore
              .collection('dealers')
              .doc(dealerDoc.id)
              .collection('vehicles')
              .count()
              .get();
            return vehiclesSnapshot.data().count || 0;
          } catch (err) {
            return 0;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        totalVehicles += batchResults.reduce((sum, count) => sum + count, 0);
      }
    } catch (err) {
      console.warn('Could not fetch vehicle counts');
    }

    const response = {
      success: true,
      data: {
        totalAdmins,
        totalDealers,
        totalVehicles
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error instanceof Error ? error.message : String(error));
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization header') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
