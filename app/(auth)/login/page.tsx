"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePlasmaStore } from "@/store/usePlasmaStore";
import FaceScanner from "@/components/auth/FaceScanner";
import { auth } from "@/lib/firebase";
import { signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";

type Mode = "face" | "manual";
type FaceState = "idle" | "scanning" | "processing" | "success" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("face");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [faceState, setFaceState] = useState<FaceState>("idle");
  const [statusMsg, setStatusMsg] = useState("▸ Initializing scanner…");
  const [manualError, setManualError] = useState("");
  const scannerKey = useRef(0);

  useEffect(() => {
    usePlasmaStore.getState().setConfig({
      color: "#00d4ff",
      speed: 0.35,
      scale: 1.15,
      opacity: 0.5,
      mouseInteractive: true,
      isVisible: true,
    });
  }, []);

  const createSession = async (idToken: string) => {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  };

  const handleFaceDetected = useCallback(async (descriptor: Float32Array) => {
    setFaceState("processing");
    setStatusMsg("▸ Matching neural pattern…");

    try {
      const res = await fetch("/api/auth/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: Array.from(descriptor) }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        setFaceState("success");
        setStatusMsg("▸ Identity confirmed. Syncing session…");
        
        // Handshake: Custom Token -> Sign In -> ID Token -> Session Cookie
        const userCredential = await signInWithCustomToken(auth, data.token);
        const idToken = await userCredential.user.getIdToken();
        await createSession(idToken);
        
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setFaceState("error");
        setStatusMsg("▸ No match found. Switch to manual login.");
      }
    } catch (err: any) {
      console.error("Login Error:", err.message);
      setFaceState("error");
      setStatusMsg("▸ System failure. Try again.");
    }
  }, [router]);

  const retryFace = () => {
    scannerKey.current += 1;
    setFaceState("idle");
    setStatusMsg("▸ Initializing scanner…");
  };

  const handleManualLogin = async () => {
    setManualError("");
    if (!email || !password) {
      setManualError("Credentials required for override.");
      return;
    }
    
    try {
      setStatusMsg("▸ Authenticating access key…");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
      router.push("/dashboard");
    } catch (err: any) {
      setManualError(err.message || "Authentication failed.");
    }
  };

  const statusColor =
    faceState === "success" ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
    : faceState === "error"   ? "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.8)]"
    : faceState === "processing" ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
    : "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]";

  const ringGlow =
    faceState === "success" ? "0 0 40px rgba(16,185,129,0.25), 0 0 0 1px rgba(16,185,129,0.5)"
    : faceState === "error"   ? "0 0 35px rgba(225,29,72,0.2), 0 0 0 1px rgba(225,29,72,0.5)"
    : faceState === "processing" ? "0 0 40px rgba(245,158,11,0.25), 0 0 0 1px rgba(245,158,11,0.5)"
    : "0 0 30px rgba(0,212,255,0.15), 0 0 0 1px rgba(0,212,255,0.3)";

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-12">
      
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
        backgroundSize: "80px 80px", zIndex: 0
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.08) 0%, transparent 70%)", zIndex: 0
      }} />

      <div className="relative z-10 w-full max-w-[500px] px-6">
        
        {/* Logo Section */}
        <motion.div 
          className="flex flex-col items-center mb-12 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            className="w-12 h-12 mb-4 border border-cyan-500/30 flex items-center justify-center rounded-sm rotate-45"
            animate={{ rotate: 225 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-cyan-400 text-xl -rotate-[180deg]">◈</span>
          </motion.div>
          <h1 className="text-white font-display font-bold text-4xl tracking-[0.4em] mb-2 drop-shadow-[0_0_25px_rgba(0,212,255,0.6)]">
            SWASTIK
          </h1>
          <p className="font-mono text-[10px] text-cyan-400/50 tracking-[0.6em] uppercase">
            Neural Interface Gateway
          </p>
        </motion.div>

        {/* Main Interface Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative group"
        >
          {/* External glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06060c]/80 backdrop-blur-3xl shadow-2xl">
            
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {(["face", "manual"] as Mode[]).map((m) => (
                <button 
                  key={m} 
                  onClick={() => setMode(m)}
                  className={`flex-1 py-5 font-mono text-[11px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 relative ${
                    mode === m ? "text-cyan-400" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <span className="text-xs">{m === "face" ? "◈" : "⌨"}</span>
                  {m === "face" ? "Neural ID" : "Manual Log"}
                  {mode === m && (
                    <motion.div 
                      layoutId="tab-active"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-10">
              <AnimatePresence mode="wait">
                
                {mode === "face" && (
                  <motion.div 
                    key="face-tab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-8 group/scanner">
                      {/* Animated Scanner Frame */}
                      <motion.div 
                        className="absolute -inset-4 rounded-xl pointer-events-none z-10 transition-all duration-500"
                        animate={{ boxShadow: ringGlow }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      
                      <FaceScanner 
                        key={scannerKey.current} 
                        onFaceDetected={handleFaceDetected} 
                        compact={true}
                      />
                    </div>

                    <div className="text-center space-y-4">
                      <motion.p 
                        className={`font-mono text-xs uppercase tracking-[0.25em] h-4 ${statusColor}`}
                        animate={{ opacity: faceState === "success" ? 1 : [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {statusMsg}
                      </motion.p>
                      
                      {faceState === "error" && (
                        <button 
                          onClick={retryFace}
                          className="px-6 py-2 rounded-full border border-white/10 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
                        >
                          ↻ Reboot Scanner
                        </button>
                      )}

                      <p className="pt-4 font-mono text-[9px] text-white/20 tracking-wider">
                        Biometric signature identified automatically
                      </p>
                    </div>
                  </motion.div>
                )}

                {mode === "manual" && (
                  <motion.div 
                    key="manual-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] text-cyan-400/40 tracking-[0.3em] uppercase ml-1">
                          Neural Address
                        </label>
                        <input 
                          type="email" 
                          placeholder="DESIGNATION@SWASTIK.CORE"
                          value={email} 
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all duration-500 placeholder:text-white/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] text-cyan-400/40 tracking-[0.3em] uppercase ml-1">
                          Access Key
                        </label>
                        <input 
                          type="password" 
                          placeholder="••••••••••••"
                          value={password} 
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleManualLogin()}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all duration-500 placeholder:text-white/10"
                        />
                      </div>

                      {manualError && (
                        <p className="font-mono text-[10px] text-rose-400 tracking-wider text-center animate-pulse">
                          ⚠ {manualError}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={handleManualLogin}
                      className="w-full py-5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-[0.4em] relative overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      <span className="relative z-10 group-hover/btn:text-white transition-colors">
                        ◈ Authenticate ◈
                      </span>
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-white/[0.02] px-10 py-5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                <span className="font-mono text-[9px] text-white/30 tracking-[0.2em] uppercase">
                  Core Link Nominal
                </span>
              </div>
              <button 
                onClick={() => router.push("/register")}
                className="font-mono text-[10px] text-white/40 hover:text-cyan-400 transition-colors uppercase tracking-widest flex items-center gap-2 group/reg"
              >
                Enroll Identity
                <span className="group-hover/reg:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer Subtext */}
        <p className="mt-8 text-center font-mono text-[9px] text-white/10 tracking-[0.4em] uppercase">
          Authorization required for neural link establishment
        </p>
      </div>
    </div>
  );
}
