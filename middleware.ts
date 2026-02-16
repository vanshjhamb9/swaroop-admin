import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Handle non-www to www redirect for API routes
    // This ensures Authorization headers are preserved
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // If accessing API routes from non-www domain, handle directly
    // instead of letting Vercel's domain redirect strip the Authorization header
    if (url.pathname.startsWith('/api/')) {
        // Add CORS headers for API routes
        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Auth-Token');

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Auth-Token',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
    ],
};
