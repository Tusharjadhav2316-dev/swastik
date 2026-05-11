"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePlasmaStore } from "@/store/usePlasmaStore";
import GlassCard from "@/components/ui/GlassCard";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    usePlasmaStore.getState().setConfig({
      color: '#7c3aed',
      speed: 0.5,
      scale: 1.2,
      opacity: 0.4,
      mouseInteractive: true,
      isVisible: true
    });
  }, []);

  const handleRegister = async () => {
    // Basic validation
    if (!email || !password) {
      setStatusMsg("▸ Missing required credentials.");
      return;
    }
    
    // In a real flow, this would call Firebase Auth: createUserWithEmailAndPassword
    // For now we simulate success and move to onboarding
    setStatusMsg("▸ Registering identity...");
    
    setTimeout(() => {
      // Pass the email to onboarding or set a temp cookie
      document.cookie = `__temp_uid=${email}; path=/; max-age=3600`;
      router.push("/onboarding");
    }, 1000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#060609] page-wrapper" style={{ backgroundColor: '#060609' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 flex flex-col items-center min-w-[360px] backdrop-blur-xl bg-black/30 border-white/10">
            <h2 className="text-[#8080a0] font-sans text-sm tracking-widest mb-2 uppercase">
              Identity Registration
            </h2>
            <div className="text-2xl font-display font-bold text-white mb-8 tracking-wider drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">
              ◈ SWASTIK
            </div>
            
            <div className="w-full space-y-5 mb-8">
              <div>
                <input
                  type="email"
                  placeholder="Allocate Neural ID (Email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-border-dim focus:border-accent-purple px-2 py-2 text-text-primary font-mono text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Set Access Code (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-border-dim focus:border-accent-purple px-2 py-2 text-text-primary font-mono text-sm outline-none transition-colors"
                />
              </div>
            </div>
            
            {statusMsg && (
              <p className="text-accent-purple font-mono text-xs mb-4 animate-pulse">
                {statusMsg}
              </p>
            )}

            <button 
              onClick={handleRegister}
              className="w-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] text-[#a78bfa] px-6 py-3 rounded-md font-mono text-sm tracking-wide hover:bg-[rgba(124,58,237,0.2)] hover:border-[rgba(124,58,237,0.5)] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300 mb-4"
            >
              CREATE IDENTITY ◈
            </button>

            <button onClick={() => router.push('/login')} className="text-text-secondary text-xs hover:text-white transition-colors mt-2">
              ← Return to Login
            </button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
