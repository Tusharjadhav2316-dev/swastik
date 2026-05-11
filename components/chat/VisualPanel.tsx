
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisualStore } from "../../store/useVisualStore";

// ─── Inline stubs for removed visual components ───────────────────────────────

function InlinePlayer({ url, type }: { url: string; type: string }) {
  if (type === "video") {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-black">
        <iframe
          src={url}
          className="w-full aspect-video rounded-xl border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <audio src={url} controls className="w-full mt-4" />
  );
}

function GlobeVisual({ pins }: { pins: unknown }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 rounded-full border border-cyan-500/30 flex items-center justify-center animate-pulse">
        <span className="text-cyan-400 text-2xl">🌐</span>
      </div>
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest text-center">
        Globe intelligence active
      </p>
      <pre className="text-[9px] text-white/20 max-h-40 overflow-auto">
        {JSON.stringify(pins, null, 2)}
      </pre>
    </div>
  );
}

// ─── Main VisualPanel ──────────────────────────────────────────────────────────

export default function VisualPanel() {
  const { activeVisual } = useVisualStore();

  return (
    <div className="w-full h-full border border-white/5 bg-white/[0.02] rounded-3xl relative overflow-hidden flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {activeVisual.type === "none" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div
              className="w-16 h-16 border border-cyan-500/20 rounded-full flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="text-cyan-400 text-2xl">◈</span>
            </motion.div>

            <h3 className="font-display text-white/40 uppercase tracking-[0.3em] text-[10px] mb-2">
              Neural Visualisation Engine
            </h3>
            <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest leading-relaxed max-w-[200px]">
              Standing by for data triggers. Charts, maps and media will manifest here.
            </p>
          </motion.div>
        ) : activeVisual.type === "player" ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                Media Pipeline: {activeVisual.data?.platform}
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/20" />
              </div>
            </div>
            <InlinePlayer url={activeVisual.data?.url} type="video" />
          </motion.div>
        ) : activeVisual.type === "globe" ? (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <GlobeVisual pins={activeVisual.data} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/10 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/10 pointer-events-none" />
    </div>
  );
}
