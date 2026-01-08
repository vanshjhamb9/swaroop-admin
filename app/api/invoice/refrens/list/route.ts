import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../firebaseadmin';
import { listInvoices, getInvoiceAnalytics } from '@/lib/refrens-helper';

export async function GET(request: NextRequest) {
  try {






    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'invoiceNumber' | 'invoiceDate' || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1') as 1 | -1;

    const response = await listInvoices({
      limit,
      skip,
      sortBy,
      sortOrder,
      startDate,
      endDate

    });

    const analytics = getInvoiceAnalytics(response.data);

    return NextResponse.json({
      success: true,
      data: {
        invoices: response.data,
        total: response.total,
        limit: response.limit,
        skip: response.skip,
        analytics
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300'
      }
    });

  } catch (error: any) {
    console.error('Error listing Refrens invoices:', error);
    return NextResponse.json(
      { error: 'Failed to list invoices', details: error.message },
      { status: 500 }
    );
  }
}
