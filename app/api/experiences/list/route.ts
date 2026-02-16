import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
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

        // Group vehicles by experienceName to create experiences list
        const experiencesMap: Record<string, {
            name: string;
            vehicles: any[];
            totalImages: number;
            createdAt: any;
            updatedAt: any;
        }> = {};

        vehiclesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const expName = data.experienceName || 'Default';

            if (!experiencesMap[expName]) {
                experiencesMap[expName] = {
                    name: expName,
                    vehicles: [],
                    totalImages: 0,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                };
            }

            experiencesMap[expName].vehicles.push({
                id: doc.id,
                name: data.name || '',
                model: data.model || '',
                registration: data.registration || '',
                images: data.images || [],
                imageCount: data.imageCount !== undefined ? data.imageCount : (data.images?.length || 0),
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            });

            experiencesMap[expName].totalImages += data.imageCount || data.images?.length || 0;

            // Track the latest updatedAt and earliest createdAt
            if (data.createdAt && (!experiencesMap[expName].createdAt ||
                (data.createdAt._seconds < experiencesMap[expName].createdAt._seconds))) {
                experiencesMap[expName].createdAt = data.createdAt;
            }
            if (data.updatedAt && (!experiencesMap[expName].updatedAt ||
                (data.updatedAt._seconds > experiencesMap[expName].updatedAt._seconds))) {
                experiencesMap[expName].updatedAt = data.updatedAt;
            }
        });

        // Convert map to array
        const experiences = Object.values(experiencesMap).map(exp => ({
            name: exp.name,
            vehicleCount: exp.vehicles.length,
            totalImages: exp.totalImages,
            vehicles: exp.vehicles,
            createdAt: exp.createdAt,
            updatedAt: exp.updatedAt,
        }));

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

        return NextResponse.json(
            { error: 'Failed to fetch experiences', details: error.message },
            { status: 500 }
        );
    }
}
