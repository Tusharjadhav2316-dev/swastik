"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useVoiceStore } from '../../store/useVoiceStore';

export default function ErrorToast() {
  const { errorMessage, clearError } = useVoiceStore();
  const [visible, setVisible] = useState(false);

  // When errorMessage is set → show → auto-dismiss after 4000ms
  useEffect(() => {
    if (errorMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(clearError, 300); // wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(clearError, 300);
  };

  return (
    <AnimatePresence>
      {visible && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ background: 'var(--bg-secondary, #0d1117)', zIndex: 9999 }}
          className="fixed top-6 right-6 flex items-center gap-3 px-[18px] py-[14px] rounded-xl
                     border border-[#00d4ff]/30 backdrop-blur-xl
                     shadow-[0_8px_32px_rgba(0,212,255,0.12)]"
        >
          {/* SW Avatar */}
          <div className="w-8 h-8 rounded-full border border-[#00d4ff] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-mono font-bold text-[#00d4ff] tracking-widest">SW</span>
          </div>

          {/* Message */}
          <p className="text-[13px] text-white/80 leading-snug max-w-[260px]">
            {errorMessage}
          </p>

          {/* Close */}
          <button
            onClick={handleClose}
            className="ml-1 p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 text-white/40 hover:text-white/80 transition-colors" />
          </button>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d4ff]/40 origin-left rounded-b-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
