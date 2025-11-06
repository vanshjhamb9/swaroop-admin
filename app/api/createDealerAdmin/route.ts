// pages/api/createAdmin.js

import { adminAuth } from "../firebaseadmin.js";

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
const db = admin.firestore();
export async function POST(req: Request) {
  try {
    const { email, isAdmin, password, contactDetails, name } = await req.json();
    console.log(email, isAdmin, password, contactDetails, name);
    //@ts-ignore
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.admin) {
      return NextResponse.json(
        { message: "Only admins can perform this action" },
        { status: 403 }
      );
    }
    const user = await adminAuth.createUser({ email, password });
    if (!user) throw "Couldnt Create User";
    const docRef = await db.collection("dealers").doc(user.uid).set({
      name,
      email,
      contactDetails,
      createdAt: Timestamp.now(),
    });

    const userRecord = await adminAuth.getUserByEmail(user.email?.trim()!);

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      dealeradmin: isAdmin,
    });

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
