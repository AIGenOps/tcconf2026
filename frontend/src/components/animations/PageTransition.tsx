"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Cinematic fade page transition.
 *
 * Wraps page content in a smooth fade-in / fade-out reveal animation.
 * No wipe bars — just a clean, cinematic opacity + subtle scale transition
 * that feels elegant and premium.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad — smooth cinematic feel
      }}
    >
      {children}
    </motion.div>
  );
}
