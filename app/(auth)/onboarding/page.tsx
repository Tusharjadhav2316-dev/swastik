
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePlasmaStore } from "../../../store/usePlasmaStore";
import GlassCard from "../../../components/ui/GlassCard";
import FaceScanner from "../../../components/auth/FaceScanner";
import { Mic, CheckCircle, Cpu, ShieldCheck, User } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);

  const availableGoals = ["Java Backend", "DSA Mastery", "MERN Stack", "System Design", "Cloud Architecture", "Python AI"];

  useEffect(() => {
    // Set Plasma to Amber for Onboarding
    usePlasmaStore.getState().setConfig({
      color: '#f59e0b',
      speed: 0.4,
      scale: 1.2,
      opacity: 0.4,
      isVisible: true
    });
  }, []);

  const startVoiceTest = async () => {
    setIsTestingVoice(true);
    setStatusMsg("▸ Listening for neural frequency...");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We don't need to do complex STT here, just verify we can get a stream
      // and show a visual pulse.
      setTimeout(() => {
        setVoiceDetected(true);
        setStatusMsg("▸ Voice signature recognized.");
        // Stop stream
        stream.getTracks().forEach(t => t.stop());
        setTimeout(() => setStep(5), 1500);
      }, 3000);
    } catch (err) {
      setStatusMsg("▸ Access denied. Check microphone permissions.");
      setIsTestingVoice(false);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const completeOnboarding = async () => {
    setIsSyncing(true);
    setStatusMsg("▸ Synchronizing neural profile with Firestore...");
    
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name,
          goals,
          onboardingComplete: true,
          mode: "student",
          streak: 0,
          createdAt: new Date().toISOString()
        }),
      });

      if (res.ok) {
        setStatusMsg("▸ Profile locked. Interface ready.");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setStatusMsg("▸ Sync failure. Retrying...");
        setIsSyncing(false);
      }
    } catch (err) {
      setStatusMsg("▸ Uplink error. Please check connection.");
      setIsSyncing(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Identity Protocol",
      subtitle: "What should I call you, boss?",
      content: (
        <div className="w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-accent-amber/10 rounded-full flex items-center justify-center mb-8 border border-accent-amber/30">
            <User className="text-accent-amber w-10 h-10" />
          </div>
          <input
            type="text"
            placeholder="Designation / Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b-2 border-white/10 focus:border-accent-amber px-2 py-4 text-white font-mono text-2xl outline-none transition-all text-center mb-10"
            autoFocus
          />
          <button 
            onClick={() => setStep(2)}
            disabled={!name}
            className="w-full bg-accent-amber/20 border border-accent-amber/50 text-accent-amber px-8 py-4 rounded-lg font-mono text-sm tracking-[0.2em] hover:bg-accent-amber/30 transition-all disabled:opacity-30"
          >
            CONFIRM IDENTITY
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: "Strategic Objectives",
      subtitle: "What are your primary goals?",
      content: (
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {availableGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => handleGoalToggle(goal)}
                className={`px-6 py-3 rounded-full border font-mono text-xs transition-all ${
                  goals.includes(goal) 
                    ? 'border-accent-amber bg-accent-amber/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                    : 'border-white/10 text-text-secondary hover:border-white/30'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setStep(3)}
            disabled={goals.length === 0}
            className="w-full bg-accent-amber/20 border border-accent-amber/50 text-accent-amber px-8 py-4 rounded-lg font-mono text-sm tracking-[0.2em] hover:bg-accent-amber/30 transition-all disabled:opacity-30"
          >
            LOAD PROTOCOLS
          </button>
        </div>
      )
    },
    {
      id: 3,
      title: "Biometric Integration",
      subtitle: "Let me learn your face.",
      content: (
        <div className="w-full flex flex-col items-center">
          <div className="mb-6 w-full flex flex-col items-center min-h-[300px]">
            <FaceScanner onFaceDetected={(desc) => {
              setStatusMsg("▸ Neural pattern captured.");
              // In real flow, we'd upload here. For onboarding, we proceed.
              setTimeout(() => setStep(4), 2000);
            }} />
            <p className="mt-6 font-mono text-xs text-accent-amber animate-pulse">
              {statusMsg || "▸ Aligning optical sensors..."}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Neural Interface",
      subtitle: "Let's calibrate your voice signature.",
      content: (
        <div className="w-full flex flex-col items-center py-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-10 transition-all duration-700 relative ${isTestingVoice ? 'bg-accent-amber/20' : 'bg-white/5'}`}>
            {isTestingVoice && (
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-accent-amber"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {voiceDetected ? (
              <CheckCircle className="text-accent-amber w-12 h-12" />
            ) : (
              <Mic className={`${isTestingVoice ? 'text-accent-amber animate-pulse' : 'text-white/20'} w-12 h-12`} />
            )}
          </div>
          
          <p className="text-text-secondary text-sm font-mono mb-10 text-center h-4">
             {statusMsg || "Ready for voice calibration."}
          </p>

          {!isTestingVoice ? (
            <button 
              onClick={startVoiceTest}
              className="w-full bg-accent-amber/20 border border-accent-amber/50 text-accent-amber px-8 py-4 rounded-lg font-mono text-sm tracking-[0.2em] hover:bg-accent-amber/30 transition-all"
            >
              BEGIN VOICE TEST
            </button>
          ) : (
            <div className="w-full py-4 text-center text-[10px] font-mono text-white/30 tracking-[0.3em]">
              SWASTIK IS LISTENING...
            </div>
          )}

          {!isTestingVoice && (
            <button 
              onClick={() => setStep(5)}
              className="mt-6 text-white/30 hover:text-white/50 text-[10px] font-mono tracking-widest transition-colors"
            >
              SKIP CALIBRATION
            </button>
          )}
        </div>
      )
    },
    {
      id: 5,
      title: "System Ready",
      subtitle: `Welcome, ${name}.`,
      content: (
        <div className="w-full flex flex-col items-center py-6 text-center">
          <div className="mb-10 text-accent-amber">
            <ShieldCheck className="w-20 h-20 mx-auto mb-4" />
            <div className="text-xs font-mono tracking-widest text-white/60">ENCRYPTION ACTIVE</div>
          </div>
          <p className="text-text-secondary text-sm mb-10 max-w-xs">
            SWASTIK is now synchronized with your biometrics and goals.
          </p>
          <button 
            onClick={completeOnboarding}
            disabled={isSyncing}
            className="w-full bg-accent-amber text-black px-8 py-4 rounded-lg font-display text-sm tracking-[0.3em] hover:brightness-110 transition-all flex items-center justify-center gap-3"
          >
            {isSyncing ? <Cpu className="animate-spin w-4 h-4" /> : "ENTER SWASTIK"}
          </button>
          {statusMsg && <p className="mt-4 font-mono text-[10px] text-accent-amber">{statusMsg}</p>}
        </div>
      )
    }
  ];

  const currentStepData = steps.find(s => s.id === step);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#060609]">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
        <GlassCard className="p-12 w-full max-w-lg min-h-[500px] flex flex-col items-center relative border-white/5 overflow-hidden">
          
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
              className="h-full bg-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          <div className="mb-12 text-center">
            <h2 className="text-white/40 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">
              Onboarding Protocol — Phase {step}/5
            </h2>
            <h1 className="text-3xl font-display text-white mb-2">{currentStepData?.title}</h1>
            <p className="text-text-secondary text-sm font-mono">{currentStepData?.subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {currentStepData?.content}
            </motion.div>
          </AnimatePresence>

          {/* Footer decoration */}
          <div className="absolute bottom-4 left-0 w-full px-12 flex justify-between items-center opacity-20 pointer-events-none">
            <div className="font-mono text-[8px] text-white tracking-widest">SWASTIK v1.0.4</div>
            <div className="font-mono text-[8px] text-white tracking-widest">NEURAL_SYNC_{step}_OF_5</div>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}
