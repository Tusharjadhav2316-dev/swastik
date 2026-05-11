"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  isVisible: boolean;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl 
                     bg-red-500/10 border border-red-500/20 backdrop-blur-xl 
                     flex items-center gap-4 shadow-[0_8px_32px_rgba(239,68,68,0.2)]
                     min-w-[320px] max-w-[90vw]"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          
          <div className="flex-grow">
            <h4 className="text-sm font-semibold text-red-500">System Error</h4>
            <p className="text-xs text-red-200/80 line-clamp-2">{message}</p>
          </div>

          <button 
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <X className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
          </button>

          {/* Progress bar */}
          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/30 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
