"use client";

import React from "react";
import { motion } from "framer-motion";
import { useVoiceStore } from "@/store/useVoiceStore";
import { useVoicePipeline } from "@/lib/voice-pipeline";

export default function VoiceBar() {
  const { voiceState, transcript } = useVoiceStore();
  const { startRecording, stopRecording } = useVoicePipeline();
  
  const isListening = voiceState === "listening";

  return (
    <div className="fixed bottom-0 left-64 right-0 h-24 z-40 bg-gradient-to-t from-[#06060c] to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto h-full flex items-center px-8 pointer-events-auto">
        
        {/* Visualizer Area */}
        <div className="flex-1 flex items-center gap-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl h-16 px-6 relative overflow-hidden group shadow-2xl">
          
          <div className="flex items-center gap-1.5 h-6">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-cyan-400/40 rounded-full"
                animate={{ 
                  height: voiceState === "listening" ? [8, 24, 12, 28, 8] : voiceState === "speaking" ? [12, 6, 20, 8, 12] : 6,
                  backgroundColor: voiceState === "listening" || voiceState === "speaking" ? "rgba(34,211,238,0.8)" : "rgba(34,211,238,0.2)"
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            <span className="font-mono text-xs text-white/40 italic tracking-wide truncate block">
              {voiceState === "listening" ? (transcript || "Listening...") : 
               voiceState === "processing" ? "Analyzing neural patterns..." :
               voiceState === "speaking" ? "SWASTIK is responding..." :
               "SWASTIK is standing by, boss. Use wake word or tap mic."}
            </span>
          </div>

          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
              isListening 
                ? "bg-rose-500 shadow-rose-500/40 rotate-90" 
                : "bg-cyan-500 shadow-cyan-500/40 hover:scale-110"
            }`}
          >
            <span className="text-white text-lg">{isListening ? "⏹" : "🎤"}</span>
          </button>

          {/* Animated scanline */}
          <motion.div 
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent skew-x-12"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

      </div>
    </div>
  );
}
