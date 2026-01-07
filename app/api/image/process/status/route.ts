import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../firebaseadmin';

/**
 * GET /api/image/process/status
 * Get processing job status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    // Get processing job
    const jobDoc = await adminFirestore
      .collection('processingJobs')
      .doc(jobId)
      .get();

    if (!jobDoc.exists) {
      return NextResponse.json(
        { error: 'Processing job not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();

    // Verify job belongs to user (unless admin)
    if (jobData?.userId !== userId && !decodedToken.admin) {
      return NextResponse.json(
        { error: 'Unauthorized to access this job' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jobData,
    });

  } catch (error: any) {
    console.error('Error fetching job status:', error);
    
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { error: 'Token expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch job status', details: error.message },
      { status: 500 }
    );
  }
}





