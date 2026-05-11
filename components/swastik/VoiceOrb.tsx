
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceStore } from "@/store/useVoiceStore";
import { useVoicePipeline } from "@/lib/voice-pipeline";

export default function VoiceOrb() {
  const { voiceState, transcript } = useVoiceStore();
  const { startRecording, stopRecording } = useVoicePipeline();

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 select-none"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
      onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
    >
      <div className="relative group cursor-pointer">
        
        {/* Outer Pulsing Rings (Listening) */}
        <AnimatePresence>
          {voiceState === "listening" && (
            <>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute inset-0 rounded-full border border-cyan-400/50"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Processing Arc */}
        <AnimatePresence>
          {voiceState === "processing" && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />
          )}
        </AnimatePresence>

        {/* Main Orb */}
        <motion.div
          animate={{
            scale: voiceState === "idle" ? [1, 1.08, 1] : 1.15,
            boxShadow: voiceState === "wake" || voiceState === "listening" || voiceState === "speaking"
              ? "0 0 50px rgba(0, 212, 255, 0.6), inset 0 0 20px rgba(0, 212, 255, 0.4)" 
              : "0 0 20px rgba(0, 212, 255, 0.2)"
          }}
          transition={{
            scale: voiceState === "idle" ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 },
            boxShadow: { duration: 0.3 }
          }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl border transition-all duration-500 shadow-2xl ${
            voiceState === "error" 
              ? "border-rose-500 bg-rose-500/20" 
              : "border-cyan-400/30 bg-gradient-to-br from-cyan-900/40 via-black/80 to-blue-900/40"
          }`}
        >
          {/* Internal Content based on state */}
          <AnimatePresence mode="wait">
            {voiceState === "speaking" ? (
              <motion.div 
                key="speaking"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 h-7"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [6, 24, 10, 28, 6] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  />
                ))}
              </motion.div>
            ) : voiceState === "listening" ? (
              <motion.div 
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-5 h-5 bg-cyan-500 rounded-full shadow-[0_0_20px_#00d4ff]"
              />
            ) : (
              <motion.div 
                key="default"
                className="w-2.5 h-2.5 bg-cyan-400/50 rounded-full animate-pulse"
              />
            )}
          </AnimatePresence>

          {/* Neural Lines Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,212,255,0.2)_100%)]" />
        </motion.div>

        {/* State Label */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <motion.span 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-display text-[9px] uppercase tracking-[0.5em] text-cyan-400 drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]"
          >
            {voiceState === "idle" ? "Hold to Sync" : voiceState}
          </motion.span>
        </div>

      </div>
    </div>
  );
}
