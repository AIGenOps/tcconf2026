"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface IntroSequenceProps {
  onComplete?: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [shouldPlay, setShouldPlay] = useState<boolean>(true);
  const [isSkipped, setIsSkipped] = useState(false);
  const pathname = usePathname();

  // Reset to initial state when route changes
  useEffect(() => {
    setShouldPlay(true);
    setIsSkipped(false);
  }, [pathname]);

  // Phase 1: When shouldPlay is true and isSkipped is false, wait 2.5s then trigger skip (fade out)
  useEffect(() => {
    if (!shouldPlay || isSkipped) return;

    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsSkipped(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [shouldPlay, isSkipped]);

  // Phase 2: When isSkipped becomes true, wait 800ms then complete the sequence (hide completely)
  useEffect(() => {
    if (!isSkipped) return;

    const timer = setTimeout(() => {
      setShouldPlay(false);
      document.body.style.overflow = "unset";
      if (onComplete) onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [isSkipped, onComplete]);

  if (!shouldPlay) {
    return null;
  }

  const WORD = "THUNDERCIPHER";

  return (
    <AnimatePresence>
      {!isSkipped && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black select-none"
        >
          {/* Ambient Glow */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-thunder-blue/10 blur-[150px] pointer-events-none" />

          {/* Cinematic Reveal Scene */}
          <div className="relative w-full flex flex-col items-center justify-center h-[320px] overflow-hidden">
            {/* Logo Text container */}
            <div 
              className="relative font-mono font-black text-white whitespace-nowrap tracking-[0.18em]"
              style={{
                fontFamily: "'Ubuntu Mono', monospace",
                fontSize: "clamp(32px, 8vw, 76px)",
                letterSpacing: "0.18em",
                fontWeight: 900
              }}
            >
              {WORD.split("").map((ch, i) => (
                <span
                  key={i}
                  className="tc-char"
                  style={{
                    animationDelay: `${0.28 + i * 0.1}s`
                  }}
                >
                  {ch}
                </span>
              ))}

              {/* Mask overlay sliding out */}
              <div
                className="absolute inset-0 bg-black origin-left"
                style={{
                  animation: "tcMask 1.6s cubic-bezier(0.76, 0, 0.24, 1) forwards",
                  animationDelay: "0.2s"
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
