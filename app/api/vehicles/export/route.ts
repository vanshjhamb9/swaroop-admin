import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles');

    // Apply filters
    if (model) {
      query = query.where('model', '==', model) as any;
    }

    const snapshot = await query.get();
    
    let vehicles = snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate 
        ? data.createdAt.toDate() 
        : data.createdAt 
        ? new Date(data.createdAt) 
        : null;
      
      return {
        id: doc.id,
        name: data.name || '',
        model: data.model || '',
        registration: data.registration || '',
        imageCount: data.imageCount || (data.images?.length || 0),
        createdAt: createdAt ? createdAt.toISOString() : null,
        createdDate: createdAt ? createdAt.toLocaleDateString('en-US') : 'N/A',
        createdTime: createdAt ? createdAt.toLocaleTimeString('en-US') : 'N/A',
      };
    });

    // Apply date filters in memory (Firestore doesn't support multiple where clauses easily)
    if (startDate || endDate) {
      vehicles = vehicles.filter(vehicle => {
        if (!vehicle.createdAt) return false;
        const vehicleDate = new Date(vehicle.createdAt);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (vehicleDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (vehicleDate > end) return false;
        }
        
        return true;
      });
    }

    // Sort by created date (newest first)
    vehicles.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Prepare Excel data
    const excelData = vehicles.map(vehicle => ({
      'Vehicle ID': vehicle.id,
      'Name': vehicle.name,
      'Model': vehicle.model,
      'Registration Number': vehicle.registration,
      'Image Count': vehicle.imageCount,
      'Created Date': vehicle.createdDate,
      'Created Time': vehicle.createdTime,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Vehicle ID
      { wch: 30 }, // Name
      { wch: 20 }, // Model
      { wch: 20 }, // Registration
      { wch: 12 }, // Image Count
      { wch: 15 }, // Created Date
      { wch: 15 }, // Created Time
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="vehicles_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Error exporting vehicles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



