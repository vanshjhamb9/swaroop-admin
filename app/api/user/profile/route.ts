import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '../../firebaseadmin';
import { verifyAuthToken } from '../../../../lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    const userId = decodedToken.uid;

    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    
    let userData = userDoc.data();
    
    if (!userData) {
      const adminDoc = await adminFirestore.collection('admins').doc(userId).get();
      const dealerDoc = await adminFirestore.collection('dealers').doc(userId).get();
      
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        userData = {
          userId,
          name: adminData?.name || '',
          email: decodedToken.email || adminData?.email || '',
          phone: decodedToken.phone_number || '',
          role: 'admin',
          planType: 'N/A',
          creditBalance: 0,
          createdAt: adminData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (dealerDoc.exists) {
        const dealerData = dealerDoc.data();
        userData = {
          userId,
          name: dealerData?.name || '',
          email: decodedToken.email || dealerData?.email || '',
          phone: decodedToken.phone_number || dealerData?.contactDetails || '',
          role: 'dealeradmin',
          planType: 'N/A',
          creditBalance: 0,
          createdAt: dealerData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        const defaultData = {
          userId,
          name: '',
          email: decodedToken.email || '',
          phone: decodedToken.phone_number || '',
          role: 'customer',
          planType: 'prepaid',
          creditBalance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await adminFirestore.collection('users').doc(userId).set(defaultData, { merge: true });
        userData = defaultData;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        name: userData.name || '',
        email: userData.email || decodedToken.email || '',
        phone: userData.phone || decodedToken.phone_number || '',
        role: userData.role || 'customer',
        planType: userData.planType || 'prepaid',
        creditBalance: userData.creditBalance || 0,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    
    if (error.message === 'Missing or invalid authorization header') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error.message },
      { status: 500 }
    );
  }
}
