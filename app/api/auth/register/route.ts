import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../firebaseadmin';
import { verifyAuthToken, requireAdmin } from '../../../../lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    requireAdmin(decodedToken);

    const body = await request.json();
    const { email, password, name, phone, planType = 'prepaid' } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone || undefined
    });

    const timestamp = new Date().toISOString();
    const userData = {
      userId: userRecord.uid,
      name,
      email,
      phone: phone || null,
      role: 'customer',
      planType,
      creditBalance: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await adminFirestore.collection('users').doc(userRecord.uid).set(userData);

    return NextResponse.json(
      {
        success: true,
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          name,
          role: 'customer',
          planType
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error registering user:', error);
    
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
      { error: 'Failed to register user', details: error.message },
      { status: 500 }
    );
  }
}
