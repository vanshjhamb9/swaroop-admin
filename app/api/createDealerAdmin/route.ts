// app/api/createDealerAdmin/route.ts
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminFirestore } from "../firebaseadmin";

export async function POST(req: Request) {
  try {
    const { email, password, name, contactDetails } = await req.json();
    
    console.log("📝 Request received:", { email, name });

    // Validate input
    if (!email || !password || !name || !contactDetails) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify authorization
    const superAdminUID = "bpzPUAg2wLZz4eljAwGFyZ0f6yF2";
    const token = req.headers.get("authorization")?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token provided" },
        { status: 403 }
      );
    }

    console.log("🔍 Verifying token...");
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log("✅ Token verified for user:", decodedToken.uid);

    if (decodedToken.uid !== superAdminUID) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid permissions" },
        { status: 403 }
      );
    }

    // Test Firestore connection first
    console.log("🧪 Testing Firestore connection...");
    try {
      const testRef = adminFirestore.collection('_test').doc('connection');
      await testRef.set({ test: true, timestamp: Timestamp.now() });
      await testRef.delete();
      console.log("✅ Firestore connection successful");
    } catch (firestoreError: any) {
      console.error("❌ Firestore connection test failed:", firestoreError);
      return NextResponse.json(
        { 
          message: "Firestore database connection failed. Please ensure Firestore is properly set up in Firebase Console.",
          error: firestoreError.message 
        },
        { status: 500 }
      );
    }

    // Create user
    console.log("👤 Creating user...");
    const user = await adminAuth.createUser({ 
      email: email.trim(), 
      password,
      displayName: name,
    });
    
    console.log("✅ User created with UID:", user.uid);

    // Create Firestore document
    console.log("💾 Creating Firestore document...");
    try {
      const dealerData = {
        name,
        email: email.trim(),
        contactDetails,
        createdAt: Timestamp.now(),
      };
      
      await adminFirestore.collection("dealers").doc(user.uid).set(dealerData);
      console.log("✅ Firestore document created");
    } catch (firestoreError: any) {
      console.error("❌ Firestore write failed:", firestoreError);
      // User was created but Firestore failed - inform user
      return NextResponse.json(
        { 
          message: "User created in Auth but failed to save to database",
          uid: user.uid,
          error: firestoreError.message 
        },
        { status: 500 }
      );
    }

    // Set custom claims
    console.log("🔐 Setting custom claims...");
    await adminAuth.setCustomUserClaims(user.uid, { dealer: true });
    console.log("✅ Custom claims set");

    return NextResponse.json(
      {
        message: "Dealer account created successfully",
        uid: user.uid,
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error("❌ Full error object:", JSON.stringify(error, null, 2));
    console.error("❌ Error code:", error.code);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}