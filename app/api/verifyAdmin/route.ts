// pages/api/createAdmin.js

import { adminAuth } from "../firebaseadmin.js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, isAdmin } = await req.json();
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

    const userRecord = await adminAuth.getUserByEmail(email);
    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    // If authorized, set the custom claim for the new admin
    await adminAuth.setCustomUserClaims(email, { admin: isAdmin });

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
