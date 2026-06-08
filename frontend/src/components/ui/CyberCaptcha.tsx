"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ShieldAlert, ShieldCheck, ArrowRight } from "lucide-react";

interface CyberCaptchaProps {
  onVerify: (verified: boolean, token: string) => void;
}

export default function CyberCaptcha({ onVerify }: CyberCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [verified, setVerified] = useState(false);
  const x = useMotionValue(0);
  
  // Transform drag X position to opacity/color values
  const trackBg = useTransform(x, [0, 240], ["rgba(239, 68, 68, 0.1)", "rgba(16, 185, 129, 0.1)"]);
  const trackBorder = useTransform(x, [0, 240], ["rgba(239, 68, 68, 0.2)", "rgba(16, 185, 129, 0.3)"]);

  const handleDragEnd = () => {
    if (x.get() > 210) {
      x.set(240);
      setVerified(true);
      // Generate a mock secure visual token
      const verificationToken = `tc_sec_token_${Math.random().toString(36).substring(2, 15)}`;
      onVerify(true, verificationToken);
    } else {
      x.set(0);
      setVerified(false);
      onVerify(false, "");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-wider text-slate-400">
        Verification
      </label>
      
      <motion.div
        ref={containerRef}
        style={{ backgroundColor: trackBg, borderColor: trackBorder }}
        className="relative h-12 rounded-xl border flex items-center justify-between px-3 overflow-hidden backdrop-blur-sm transition-all"
      >
        {/* Sliding Area Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-[10px] font-mono tracking-widest">
          {verified ? (
            <span className="text-emerald-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 animate-pulse" /> Verification Successful
            </span>
          ) : (
            <span className="text-slate-400 flex items-center font-sans">
              Slide to unlock <ArrowRight className="w-3 h-3 ml-1.5 animate-pulse text-thunder-cyan" />
            </span>
          )}
        </div>

        {/* Slidable Block */}
        {!verified ? (
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 240 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="w-10 h-8 rounded-lg bg-thunder-blue hover:bg-thunder-cyan text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-glow-blue z-10 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
          </motion.div>
        ) : (
          <div className="w-10 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center ml-auto shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
