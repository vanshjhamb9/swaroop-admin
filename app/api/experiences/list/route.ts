import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
    let token: string | undefined;
    try {
        token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(token);
        const dealerId = decodedToken.uid;

        // Fetch all vehicles for this dealer
        const vehiclesSnapshot = await adminFirestore
            .collection('dealers')
            .doc(dealerId)
            .collection('vehicles')
            .get();

        // Map each vehicle to a separate experience (1:1 mapping)
        const experiences = vehiclesSnapshot.docs.map(doc => {
            const data = doc.data();
            const expName = data.experienceName || 'Default';

            return {
                id: doc.id,
                name: expName,
                vehicleCount: 1,
                totalImages: data.imageCount || data.images?.length || 0,
                vehicles: [{
                    id: doc.id,
                    name: data.name || '',
                    model: data.model || '',
                    registration: data.registration || '',
                    images: data.images || [],
                    imageCount: data.imageCount !== undefined ? data.imageCount : (data.images?.length || 0),
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                }],
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
        });

        // Sort by createdAt descending (newest first)
        experiences.sort((a, b) => {
            const timeA = a.createdAt?._seconds || 0;
            const timeB = b.createdAt?._seconds || 0;
            return timeB - timeA;
        });

        return NextResponse.json({
            success: true,
            data: {
                experiences,
                totalExperiences: experiences.length,
                totalVehicles: vehiclesSnapshot.docs.length,
            }
        });

    } catch (error: any) {
        console.error('Error fetching experiences:', error);

        if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            return NextResponse.json(
                { error: 'Token expired or invalid' },
                { status: 401 }
            );
        }

        if (error.code === 'auth/argument-error' || error.message?.includes('Decoding Firebase ID token failed')) {
            return NextResponse.json(
                {
                    error: 'Invalid ID token format',
                    details: 'Ensure you are sending a valid Firebase ID token (JWT). Do not send a refresh token or access token.',
                    token_received: token ? token.substring(0, 10) + '...' : 'none'
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch experiences', details: error.message },
            { status: 500 }
        );
    }
}
