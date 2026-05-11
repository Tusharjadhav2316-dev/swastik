
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    // Set cookie parameters.
    const options = {
      name: "__session",
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    
    // Add the cookie to the response.
    const response = NextResponse.json({ success: true });
    (await cookies()).set(options);
    
    return response;
  } catch (error: any) {
    console.error("Session API Error:", error.message);
    return NextResponse.json({ error: "Failed to create session" }, { status: 401 });
  }
}
