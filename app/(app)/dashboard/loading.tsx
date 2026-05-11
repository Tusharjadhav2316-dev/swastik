"use client";

import React from 'react';
import GlassCard from "../../../components/ui/GlassCard";
import { BrainCircuit } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 animate-pulse">
      
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <div className="h-10 w-64 bg-white/5 rounded-lg" />
          <div className="h-4 w-48 bg-white/5 rounded-md" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-2">
            <div className="h-2 w-20 bg-white/5 rounded" />
            <div className="h-8 w-24 bg-white/5 rounded-md" />
          </div>
          {/* Streak circle skeleton — 64px per spec */}
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Intelligence Cards Skeleton */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {[1, 2].map((i) => (
            <GlassCard key={i} className="p-8 border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-xl mb-6" />
              <div className="h-6 w-32 bg-white/5 rounded mb-4" />
              <div className="h-3 w-48 bg-white/5 rounded mb-6" />
              <div className="h-2 w-16 bg-white/5 rounded" />
            </GlassCard>
          ))}

          <GlassCard className="p-8 md:col-span-2 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="h-6 w-40 bg-white/5 rounded" />
              <div className="h-3 w-16 bg-white/5 rounded" />
            </div>
            
            {/* Goals skeleton — 2 divs h-16 rounded-lg per spec */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Daily Tasks & Systems Skeleton */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-8 border-white/5 flex-1">
            <div className="h-6 w-32 bg-white/5 rounded mb-8" />
            {/* Tasks skeleton — 3 divs h-12 rounded-md per spec */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-md animate-pulse" />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-white/5 border-white/10">
             <div className="h-2 w-24 bg-white/10 rounded mb-4" />
             <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-white/10 rounded" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
             </div>
          </GlassCard>
        </div>

      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-12 right-12 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <BrainCircuit className="w-4 h-4 text-accent-cyan animate-spin" />
        <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Syncing Protocols</span>
      </div>
    </div>
  );
}
