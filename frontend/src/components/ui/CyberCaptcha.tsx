"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldAlert, ShieldCheck, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface CyberCaptchaProps {
  onVerify: (verified: boolean, token: string) => void;
}

export default function CyberCaptcha({ onVerify }: CyberCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [verified, setVerified] = useState(false);
  const [dragRange, setDragRange] = useState(240);
  const x = useMotionValue(0);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Slidable block width is w-10 = 40px. px-3 padding is 12px * 2 = 24px.
        const range = containerWidth - 40 - 24;
        if (range > 50) {
          setDragRange(range);
        }
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamically interpolate red-to-green values based on computed dragRange
  const trackBg = useTransform(x, (v) => {
    const progress = Math.min(Math.max(v / dragRange, 0), 1);
    const red = Math.round(239 - (239 - 16) * progress);
    const green = Math.round(68 + (185 - 68) * progress);
    const blue = Math.round(68 + (129 - 68) * progress);
    return `rgba(${red}, ${green}, ${blue}, 0.1)`;
  });

  const trackBorder = useTransform(x, (v) => {
    const progress = Math.min(Math.max(v / dragRange, 0), 1);
    const red = Math.round(239 - (239 - 16) * progress);
    const green = Math.round(68 + (185 - 68) * progress);
    const blue = Math.round(68 + (129 - 68) * progress);
    const alpha = 0.2 + 0.1 * progress;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  });

  const handleDragEnd = () => {
    if (x.get() > dragRange - 30) {
      x.set(dragRange);
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
      <label className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
        Verification Security
      </label>
      
      <motion.div
        ref={containerRef}
        style={{ backgroundColor: trackBg, borderColor: trackBorder }}
        className="relative h-12 rounded-xl border flex items-center justify-between px-3 overflow-hidden backdrop-blur-sm transition-all"
      >
        {/* Sliding Area Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-xs font-mono tracking-widest font-bold">
          {verified ? (
            <span className="text-emerald-400 flex items-center">
              <HugeiconsIcon icon={ShieldCheck} className="w-4.5 h-4.5 mr-1 animate-pulse" /> Verification Successful
            </span>
          ) : (
            <span className="text-slate-200 flex items-center font-sans">
              Slide to unlock <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1.5 animate-pulse text-thunder-cyan" />
            </span>
          )}
        </div>

        {/* Slidable Block */}
        {!verified ? (
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: dragRange }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="w-10 h-8 rounded-lg bg-thunder-blue hover:bg-thunder-cyan text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-glow-blue z-10 transition-colors"
          >
            <HugeiconsIcon icon={ShieldAlert} className="w-4 h-4" />
          </motion.div>
        ) : (
          <div className="w-10 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center ml-auto shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <HugeiconsIcon icon={ShieldCheck} className="w-4.5 h-4.5" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
