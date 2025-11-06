// pages/api/createAdmin.js

import { adminAuth } from "../firebaseadmin.js";

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const db = admin.firestore();
export async function POST(req: Request) {
  try {
    const { email, isAdmin, password, name } = await req.json();
    console.log(req.headers.get("authorization")?.split(" ")[1]);
    // Check if the request is coming from the Super Admin
    // For example, using their UID (assuming you have stored it somewhere securely)
    const superAdminUID = "bpzPUAg2wLZz4eljAwGFyZ0f6yF2"; // Replace with actual Super Admin UID

    //@ts-ignore
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.uid !== superAdminUID) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const user = await adminAuth.createUser({ email, password });
    if (!user) throw "Couldnt Create User";
    const docRef = db.collection("admins").doc(user.uid);
    await docRef.set({
      name,
      email,
      createdAt: Timestamp.now(),
    });

    const userRecord = await adminAuth.getUserByEmail(user.email?.trim()!);
    console.log("user Reacord", userRecord);
    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    // If authorized, set the custom claim for the new admin
    await adminAuth.setCustomUserClaims(userRecord.uid, { admin: isAdmin });

    return NextResponse.json(
      {
        message: "Admin privileges granted",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { message: (error as any).message },
      { status: 500 }
    );
  }
}
