"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [shouldPlay, setShouldPlay] = useState<boolean | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    // Check if intro has already been played in this session
    const introPlayed = sessionStorage.getItem("tcconf2026_intro_played");
    if (introPlayed === "true") {
      setShouldPlay(false);
      onComplete();
    } else {
      setShouldPlay(true);
      document.body.style.overflow = "hidden";
    }
  }, [onComplete]);

  const handleComplete = () => {
    sessionStorage.setItem("tcconf2026_intro_played", "true");
    document.body.style.overflow = "unset";
    setShouldPlay(false);
    onComplete();
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimationKey((prev) => prev + 1);
  };

  if (shouldPlay === false || shouldPlay === null) {
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
              key={animationKey}
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
                  key={`${i}-${animationKey}`}
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
                key={`mask-${animationKey}`}
                className="absolute inset-0 bg-black origin-left"
                style={{
                  animation: "tcMask 1.6s cubic-bezier(0.76, 0, 0.24, 1) forwards",
                  animationDelay: "0.2s"
                }}
              />
            </div>

            {/* Replay and Enter/Skip CTA */}
            <div className="absolute bottom-4 flex items-center space-x-4">
              <button
                onClick={handleReplay}
                className="px-5 py-2 text-[10px] font-mono tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-full bg-black/40 backdrop-blur-md transition-all duration-300 opacity-0 cursor-pointer"
                style={{
                  animation: "tcFadeBtn 0.4s ease forwards",
                  animationDelay: "2.6s"
                }}
              >
                ↺ REPLAY
              </button>

              <button
                onClick={() => {
                  setIsSkipped(true);
                  setTimeout(handleComplete, 800);
                }}
                className="px-6 py-2 text-[10px] font-mono tracking-widest text-thunder-cyan border border-thunder-cyan/20 hover:border-thunder-cyan hover:bg-thunder-cyan/10 rounded-full bg-black/40 backdrop-blur-md transition-all duration-300 opacity-0 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                style={{
                  animation: "tcFadeBtn 0.4s ease forwards",
                  animationDelay: "2.0s"
                }}
              >
                ENTER SITE →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
