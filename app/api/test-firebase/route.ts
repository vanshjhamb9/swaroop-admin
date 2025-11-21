import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore, adminAuth } from '../firebaseadmin';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Firebase Admin connection...');
    
    // Test 1: Check if Firestore is initialized
    if (!adminFirestore) {
      throw new Error('Firestore not initialized');
    }
    console.log('✅ Firestore instance exists');

    // Test 2: Try to list collections
    try {
      const collections = await adminFirestore.listCollections();
      console.log('✅ Can list collections:', collections.map(c => c.id));
      
      // Test 3: Try to read from a collection
      const dealersSnapshot = await adminFirestore.collection('dealers').limit(1).get();
      console.log('✅ Can query dealers collection, size:', dealersSnapshot.size);

      const adminsSnapshot = await adminFirestore.collection('admins').limit(1).get();
      console.log('✅ Can query admins collection, size:', adminsSnapshot.size);

      const usersSnapshot = await adminFirestore.collection('users').limit(1).get();
      console.log('✅ Can query users collection, size:', usersSnapshot.size);

      return NextResponse.json({
        success: true,
        message: 'Firebase Admin is working correctly',
        collections: collections.map(c => c.id),
        counts: {
          dealers: dealersSnapshot.size,
          admins: adminsSnapshot.size,
          users: usersSnapshot.size
        }
      });
    } catch (firestoreError: any) {
      console.error('❌ Firestore query error:', firestoreError);
      return NextResponse.json({
        success: false,
        error: 'Firestore query failed',
        details: firestoreError.message,
        code: firestoreError.code,
        stack: firestoreError.stack
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ Firebase Admin test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Firebase Admin test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}