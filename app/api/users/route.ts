import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '../firebaseadmin';
import { verifyAuthToken, requireAdmin } from '../../../lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const startAfter = searchParams.get('startAfter') || null;

    let query = adminFirestore.collection('users').orderBy('createdAt', 'desc').limit(limit);
    
    if (startAfter) {
      const startDoc = await adminFirestore.collection('users').doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'customer',
        planType: data.planType || 'prepaid',
        creditBalance: data.creditBalance || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    // Make total count optional via query parameter (expensive operation)
    const includeTotal = searchParams.get('includeTotal') === 'true';
    let total = undefined;
    
    if (includeTotal) {
      try {
        const totalCountSnapshot = await adminFirestore.collection('users').count().get();
        total = totalCountSnapshot.data().count;
      } catch (err) {
        // If count fails, just skip it
      }
    }

    const response: any = {
      success: true,
      data: {
        users,
        limit,
        hasMore: snapshot.size === limit
      }
    };

    if (total !== undefined) {
      response.data.total = total;
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching users:', error);
    
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
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}
