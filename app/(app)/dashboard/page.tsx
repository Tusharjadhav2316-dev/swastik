
"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { usePlasmaStore } from "../../../store/usePlasmaStore";
import GlassCard from "../../../components/ui/GlassCard";
import { 
  Trophy, 
  Flame, 
  Target, 
  Calendar, 
  ChevronRight, 
  BrainCircuit, 
  Globe, 
  Code2,
  Clock
} from "lucide-react";
import { triggerMorningBrief } from "../../../lib/morning-brief";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: profile, error } = useSWR("/api/profile", fetcher);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Set Plasma to subtle ambient Cyan
    usePlasmaStore.getState().setConfig({
      color: '#00d4ff',
      speed: 0.15,
      scale: 1.5,
      opacity: 0.08,
      isVisible: true
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Trigger Morning Brief once
    if (profile && !profile.briefPlayedToday) {
      triggerMorningBrief(profile);
    }

    return () => clearInterval(timer);
  }, [profile]);

  if (error) return <div className="p-20 text-red-500">System Error: Failed to load profile protocols.</div>;
  if (!profile) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <BrainCircuit className="w-12 h-12 text-cyan-500/20" />
        <p className="font-mono text-xs text-white/20 tracking-[0.3em]">INITIALIZING DASHBOARD...</p>
      </div>
    </div>
  );

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-4xl font-display font-light text-white tracking-tight">
            {greeting}, <span className="text-accent-cyan">{profile.displayName || "Boss"}</span>.
          </h1>
          <p className="text-text-secondary font-mono text-xs tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 
            <span className="mx-2 opacity-30">|</span> 
            <Calendar className="w-3 h-3" />
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-mono text-text-secondary tracking-[0.2em]">CURRENT STREAK</div>
            <div className="text-2xl font-display text-white flex items-center gap-2">
              <Flame className="text-orange-500 w-5 h-5 fill-orange-500/20" />
              {profile.streak || 0} DAYS
            </div>
          </div>
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
            <Trophy className="text-accent-amber w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Intelligence Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <ActionCard 
            title="World Intelligence" 
            desc="Global events and threat analysis."
            icon={<Globe className="w-5 h-5" />}
            color="cyan"
            href="/world"
          />
          
          <ActionCard 
            title="Coding Lab" 
            desc="Interactive DSA and system design."
            icon={<Code2 className="w-5 h-5" />}
            color="purple"
            href="/code"
          />

          <GlassCard className="p-8 md:col-span-2 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-display text-lg flex items-center gap-2">
                <Target className="text-accent-cyan w-5 h-5" />
                Active Objectives
              </h3>
              <button className="text-[10px] font-mono text-text-secondary hover:text-white transition-colors tracking-widest">VIEW ALL</button>
            </div>
            
            <div className="space-y-6">
              {(profile.goals || ["MERN Stack Mastery", "DSA Advanced"]).map((goal: string, i: number) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">{goal}</span>
                    <span className="text-accent-cyan">{30 + (i * 15)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${30 + (i * 15)}%` }}
                      className="h-full bg-accent-cyan shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Daily Tasks & Systems */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-8 border-white/5 flex-1">
            <h3 className="text-white font-display text-lg mb-6 flex items-center gap-2">
              <BrainCircuit className="text-accent-amber w-5 h-5" />
              Daily Tasks
            </h3>
            <div className="space-y-4">
              {[
                "Practice Binary Search Trees",
                "Review System Architecture",
                "Update SWASTIK Protocols"
              ].map((task, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10 cursor-pointer">
                  <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-accent-cyan transition-colors">
                    <div className="w-2 h-2 bg-accent-cyan scale-0 group-hover:scale-100 transition-transform rounded-sm" />
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{task}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-accent-cyan/10 border-accent-cyan/20">
             <div className="text-[10px] font-mono text-accent-cyan tracking-widest mb-2 uppercase">System Status</div>
             <div className="flex items-center justify-between">
                <span className="text-sm font-display text-white">All Modules Online</span>
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_#00d4ff]" />
             </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, color, href }: any) {
  const accentClass = color === 'cyan' ? 'text-accent-cyan' : 'text-purple-400';
  const bgClass = color === 'cyan' ? 'bg-accent-cyan/10' : 'bg-purple-500/10';

  return (
    <GlassCard className="p-8 hover:bg-white/5 transition-all cursor-pointer group border-white/5 overflow-hidden">
      <div className={`w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { className: `${accentClass} w-6 h-6` })}
      </div>
      <h3 className="text-white font-display text-xl mb-2 group-hover:text-accent-cyan transition-colors">{title}</h3>
      <p className="text-text-secondary text-xs leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center gap-2 text-[10px] font-mono text-accent-cyan tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
        INITIALIZE <ChevronRight className="w-3 h-3" />
      </div>
    </GlassCard>
  );
}
