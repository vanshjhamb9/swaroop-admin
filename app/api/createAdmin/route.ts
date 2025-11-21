// pages/api/createAdmin.js

import { adminAuth } from "../firebaseadmin.js";
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { email, isAdmin, password, name } = await req.json();
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    console.log(req.headers.get("authorization")?.split(" ")[1]);
    
    const superAdminUID = "bpzPUAg2wLZz4eljAwGFyZ0f6yF2";

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.uid !== superAdminUID) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Check if user already exists
    try {
      const existingUser = await adminAuth.getUserByEmail(email.trim());
      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error: any) {
      // User doesn't exist, which is what we want
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create the user
    const user = await adminAuth.createUser({ 
      email: email.trim(), 
      password 
    });
    
    if (!user || !user.uid) {
      throw new Error("Couldn't create user");
    }

    // Create Firestore document
    const docRef = db.collection("admins").doc(user.uid);
    await docRef.set({
      name,
      email: email.trim(),
      createdAt: Timestamp.now(),
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(user.uid, { admin: isAdmin });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        uid: user.uid,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating admin:", error);
    
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
        { message: "Password is too weak" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}