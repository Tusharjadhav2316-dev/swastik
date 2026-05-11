"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BootScreen() {
  const router = useRouter();
  const [status, setStatus] = useState("Initialising voice engine...");

  useEffect(() => {
    const t1 = setTimeout(() => setStatus("Synchronizing neural nodes..."), 1200);
    const t2 = setTimeout(() => setStatus("Decrypting biometric layers..."), 2500);
    const t3 = setTimeout(() => setStatus("Interface ready."), 3500);
    const t4 = setTimeout(() => router.push("/login"), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 page-wrapper" style={{ backgroundColor: '#000000' }}>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-white text-3xl md:text-4xl font-display font-bold tracking-widest drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] text-center">
              ◈ S W A S T I K
            </span>
          </div>
          <h2 className="text-slate-400 font-sans text-sm tracking-widest mb-12 uppercase">
            Neural Interface System v2.0
          </h2>
          
          <div className="w-64 h-[2px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
          
          <p className="text-[#8080a0] font-mono text-xs animate-pulse">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
