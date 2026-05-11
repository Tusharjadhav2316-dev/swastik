
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "◈" },
  { name: "Neural Chat", href: "/chat", icon: "⌨" },
  { name: "Master Goals", href: "/goals", icon: "⦿" },
  { name: "Daily Tasks", href: "/tasks", icon: "✓" },
  { name: "World Intel", href: "/world", icon: "🌐" },
  { name: "Settings", href: "/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 z-50 border-r border-white/5 bg-[#06060c]/60 backdrop-blur-2xl flex flex-col">
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-cyan-500/40 flex items-center justify-center rounded rotate-45 group-hover:rotate-[225deg] transition-transform duration-700">
            <span className="text-cyan-400 text-xs -rotate-45 group-hover:rotate-[-225deg] transition-transform duration-700">◈</span>
          </div>
          <span className="text-white font-display font-bold tracking-[0.2em] text-lg">SWASTIK</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                isActive ? "text-cyan-400 bg-cyan-400/5" : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="text-lg opacity-70 group-hover:opacity-100">{item.icon}</span>
              <span className="font-mono text-[11px] uppercase tracking-widest">{item.name}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-400">
            TS
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-white/80 uppercase tracking-wider">Tushar</span>
            <span className="text-[8px] font-mono text-cyan-400/50 uppercase tracking-widest">Level 12 Specialist</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
