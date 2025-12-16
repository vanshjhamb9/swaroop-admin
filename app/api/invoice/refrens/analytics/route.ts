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

    const allInvoicesResponse = await listInvoices({ limit: 1000, sortOrder: -1, sortBy: 'createdAt' });
    const analytics = getInvoiceAnalytics(allInvoicesResponse.data);

    const monthlyData: { [key: string]: { count: number; revenue: number; pending: number } } = {};
    
    allInvoicesResponse.data.forEach(invoice => {
      const date = new Date(invoice.invoiceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, revenue: 0, pending: 0 };
      }
      
      monthlyData[monthKey].count++;
      
      if (invoice.status === 'PAID') {
        monthlyData[monthKey].revenue += invoice.finalTotal?.total || 0;
      } else if (invoice.status === 'UNPAID' || invoice.status === 'PARTIALLY_PAID') {
        monthlyData[monthKey].pending += invoice.finalTotal?.total || 0;
      }
    });

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    const statusDistribution = [
      { status: 'Paid', count: analytics.paidInvoices, color: '#4caf50' },
      { status: 'Unpaid', count: analytics.unpaidInvoices, color: '#ff9800' },
      { status: 'Partially Paid', count: analytics.partiallyPaidInvoices, color: '#2196f3' },
      { status: 'Canceled', count: analytics.canceledInvoices, color: '#f44336' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        overview: analytics,
        monthlyTrends,
        statusDistribution,
        recentInvoices: allInvoicesResponse.data.slice(0, 10)
      }
    });

  } catch (error: any) {
    console.error('Error fetching Refrens analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
