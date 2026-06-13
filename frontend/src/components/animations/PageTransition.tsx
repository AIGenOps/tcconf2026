"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface PageTransitionProps {
  stage: "entering" | "exiting" | "idle";
  onEnterComplete: () => void;
  onExitComplete: () => void;
}

export default function PageTransition({ stage, onEnterComplete, onExitComplete }: PageTransitionProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (stage === "entering") {
      controls.start({
        d: [
          "M 0 0 H 100 V 0 Q 50 0 0 0 Z",
          "M 0 0 H 100 V 100 Q 50 125 0 100 Z",
          "M 0 0 H 100 V 100 Q 50 100 0 100 Z"
        ],
        transition: {
          duration: 0.65,
          times: [0, 0.65, 1],
          ease: [0.76, 0, 0.24, 1]
        }
      }).then(onEnterComplete);
    } else if (stage === "exiting") {
      controls.start({
        d: [
          "M 0 0 Q 50 0 100 0 V 100 H 0 Z",
          "M 0 100 Q 50 120 100 100 V 100 H 0 Z",
          "M 0 100 Q 50 100 100 100 V 100 H 0 Z"
        ],
        transition: {
          duration: 0.65,
          times: [0, 0.35, 1],
          ease: [0.76, 0, 0.24, 1]
        }
      }).then(onExitComplete);
    }
  }, [stage, controls, onEnterComplete, onExitComplete]);

  if (stage === "idle") return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center">
      {/* Curved SVG curtain */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <motion.path
          animate={controls}
          initial={{
            d: stage === "entering" 
              ? "M 0 0 H 100 V 0 Q 50 0 0 0 Z" 
              : "M 0 0 Q 50 0 100 0 V 100 H 0 Z"
          }}
          fill="#050508"
        />
      </svg>

      {/* Cyber Loader Branding in center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: stage === "entering" ? [0, 1] : [1, 0],
          scale: stage === "entering" ? [0.9, 1] : [1, 0.95]
        }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex flex-col items-center space-y-4"
      >
        {/* Pulsing cyber ring */}
        <div className="w-12 h-12 rounded-full border-2 border-thunder-cyan/30 border-t-thunder-cyan animate-spin" />
        <span className="font-mono text-[10px] font-bold tracking-[0.4em] text-thunder-cyan uppercase animate-pulse">
          INITIALIZING_TRANSMISSION...
        </span>
      </motion.div>
    </div>
  );
}
