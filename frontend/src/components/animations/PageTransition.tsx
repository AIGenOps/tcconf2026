"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Cinematic morphing page transition.
 *
 * Wraps page content in a reveal animation that plays on mount:
 *   1. Three horizontal "wipe" bars sweep across the viewport.
 *   2. Once the bars retract, the page content fades and scales in
 *      with a subtle upward slide.
 *
 * Usage — wrap the outermost JSX of every page:
 *   <PageTransition> …page content… </PageTransition>
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [showBars, setShowBars] = useState(true);

  /* Re-trigger bars whenever the pathname changes (client nav) */
  useEffect(() => {
    setShowBars(true);
    const timer = setTimeout(() => setShowBars(false), 700);
    return () => clearTimeout(timer);
  }, [pathname]);

  const barColors = [
    "rgba(0, 240, 255, 0.12)", // thunder-cyan tint
    "rgba(59, 130, 246, 0.10)", // thunder-blue tint
    "rgba(0, 240, 255, 0.06)", // faint cyan
  ];

  return (
    <>
      {/* ─── Wipe Bars ─── */}
      <AnimatePresence>
        {showBars &&
          barColors.map((bg, i) => (
            <motion.div
              key={`bar-${i}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{
                duration: 0.45,
                delay: i * 0.08,
                ease: [0.77, 0, 0.175, 1], // circ-in-out
              }}
              style={{
                position: "fixed",
                inset: 0,
                top: `${i * 33.34}%`,
                height: "33.4%",
                background: bg,
                transformOrigin: i % 2 === 0 ? "left" : "right",
                zIndex: 9999 - i,
                pointerEvents: "none",
                backdropFilter: "blur(2px)",
              }}
            />
          ))}
      </AnimatePresence>

      {/* ─── Page Content ─── */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.65,
          delay: 0.25,
          ease: [0.16, 1, 0.3, 1], // expo-out
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
