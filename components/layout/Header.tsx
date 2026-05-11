
"use client";

import React from "react";
import { motion } from "framer-motion";

const modes = [
  { id: "student", name: "Student", color: "text-cyan-400" },
  { id: "work", name: "Work", color: "text-amber-400" },
  { id: "chill", name: "Chill", color: "text-emerald-400" },
];

export default function Header() {
  const [activeMode, setActiveMode] = React.useState("student");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 fixed top-0 left-64 right-0 z-40 border-b border-white/5 bg-[#06060c]/40 backdrop-blur-md px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-5 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 relative ${
                activeMode === mode.id ? "text-white" : "text-white/30 hover:text-white/50"
              }`}
            >
              <span className="relative z-10">{mode.name}</span>
              {activeMode === mode.id && (
                <motion.div 
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-white/10 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          Neural Link: Secure
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right min-w-[80px]">
          <div className="text-[11px] font-mono text-white/80 tracking-widest uppercase">
            {mounted ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--"}
          </div>
          <div className="text-[8px] font-mono text-white/20 tracking-tighter uppercase">
            {mounted ? new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : "--- -- ---"}
          </div>
        </div>
        
        <div className="w-px h-8 bg-white/10" />
        
        <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
          <span className="text-lg">🔔</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#06060c]" />
        </button>
      </div>
    </header>
  );
}
