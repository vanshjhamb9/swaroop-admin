import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBsz7bMlHbAt320x0-IS4ZopZEzW-B70RY';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Login request received for:', email);

    const verifyPasswordResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const verifyData = await verifyPasswordResponse.json();
    console.log('Verify password response status:', verifyPasswordResponse.status);

    if (!verifyPasswordResponse.ok) {
      console.error('Verify password failed:', verifyData);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userId = verifyData.localId;
    console.log('User verified, ID:', userId);

    const userRecord = await adminAuth.getUser(userId);
    console.log('User record fetched');

    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    console.log('User doc fetched, exists:', userDoc.exists);
    const userData = userDoc.data();

    let role = 'customer';
    const adminDoc = await adminFirestore.collection('admins').doc(userId).get();
    const dealerDoc = await adminFirestore.collection('dealers').doc(userId).get();

    if (adminDoc.exists) {
      role = 'admin';
    } else if (dealerDoc.exists) {
      role = 'dealeradmin';
    }
    console.log('User role determined:', role);

    const customToken = await adminAuth.createCustomToken(userId);
    console.log('Custom token created');

    return NextResponse.json({
      success: true,
      data: {
        customToken,
        idToken: verifyData.idToken,
        refreshToken: verifyData.refreshToken,
        user: {
          uid: userId,
          email: userRecord.email,
          name: userRecord.displayName || userData?.name || '',
          phone: userRecord.phoneNumber,
          role,
          planType: userData?.planType || 'prepaid',
          creditBalance: userData?.creditBalance || 0
        }
      }
    });

  } catch (error: any) {
    console.error('Error during login:', error);

    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}
