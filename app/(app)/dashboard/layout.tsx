"use client";

import React from "react";
import Plasma from "@/components/plasma/Plasma";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full bg-[#060609] text-text-primary overflow-hidden font-sans page-wrapper" style={{ backgroundColor: '#060609' }}>


      {/* Left Sidebar */}
      <aside className="relative z-10 w-[240px] h-full glass-card border-l-0 border-t-0 border-b-0 rounded-none flex flex-col p-6">
        <div className="mb-10 text-2xl font-display font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
          ◈ SWASTIK
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 font-mono text-sm text-text-secondary">
          <button className="flex items-center gap-3 px-4 py-3 bg-accent-cyan-dim text-accent-cyan-text border border-border-cyan rounded-xl transition-all">
            <span className="text-lg">🏠</span> Home
          </button>
          <button className="flex items-center gap-3 px-4 py-3 hover:text-white transition-all rounded-xl hover:bg-bg-glass-hover">
            <span className="text-lg">🌍</span> World
          </button>
          <button className="flex items-center gap-3 px-4 py-3 hover:text-white transition-all rounded-xl hover:bg-bg-glass-hover">
            <span className="text-lg">💬</span> Chat
          </button>
          <button className="flex items-center gap-3 px-4 py-3 hover:text-white transition-all rounded-xl hover:bg-bg-glass-hover">
            <span className="text-lg">💻</span> Code
          </button>
        </nav>

        <div className="mt-auto">
          <div className="text-xs font-mono text-text-muted mb-2 uppercase">Streak</div>
          <div className="glass-card p-3 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-mono text-sm">7 Days</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col h-full">
        {/* Header Bar */}
        <header className="h-20 border-b border-border-dim flex items-center justify-between px-8 bg-transparent">
          <div className="mode-badge mode-student px-4 py-1.5 border rounded-full font-mono text-xs font-bold uppercase tracking-widest bg-bg-glass">
            📚 Student Mode
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-border-cyan transition-colors">
              🔔
            </button>
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-border-cyan transition-colors">
              ⚙️
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan border-2 border-bg-base"></div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>

      {/* Voice Orb (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
          Say "Hey Swastik"...
        </div>
        <div className="relative w-16 h-16 rounded-full glass-card flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" style={{ animation: 'orbIdle 4s infinite' }}>
          <div className="absolute inset-2 rounded-full overflow-hidden">
            <Plasma color="#00d4ff" speed={1.5} opacity={0.7} scale={0.5} mouseInteractive={false} />
          </div>
          {/* SVG ring */}
          <svg className="absolute inset-0 w-full h-full text-border-cyan" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
