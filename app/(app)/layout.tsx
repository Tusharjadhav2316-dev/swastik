
import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import VoiceBar from "../../components/layout/VoiceBar";
import VoiceOrb from "../../components/swastik/VoiceOrb";
import VoiceInitializer from "../../components/swastik/VoiceInitializer";
import ErrorToast from "../../components/swastik/ErrorToast";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "../../lib/firebase-admin";
import { cookies } from "next/headers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // 1. Verify Onboarding Status (Server-side)
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) redirect("/login");

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists || !userDoc.data()?.onboardingComplete) {
      redirect("/onboarding");
    }
  } catch (e) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#06060c] text-white">
      <Sidebar />
      <Header />
      
      <main className="pl-64 pt-20 pb-24 min-h-screen relative z-10">
        <div className="p-8 h-[calc(100vh-176px)] overflow-hidden">
          {children}
        </div>
      </main>

      <VoiceBar />
      <VoiceOrb />
      <VoiceInitializer />
      <ErrorToast />
    </div>
  );
}
