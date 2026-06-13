"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import IntroSequence from "./IntroSequence";
import PageTransition from "./PageTransition";

interface SiteWrapperProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function SiteWrapper({ children, navbar, footer }: SiteWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMainPage = pathname === "/";
  const [introActive, setIntroActive] = useState(isMainPage);

  // Central routing transition states
  const [transitionStage, setTransitionStage] = useState<"idle" | "entering" | "exiting">("idle");
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // Reset intro state to active whenever route/pathname changes (only on homepage)
  useEffect(() => {
    if (pathname === "/") {
      setIntroActive(true);
    } else {
      setIntroActive(false);
    }
  }, [pathname]);

  // Click interceptor for global page transitions
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      // Ignore external links, mailto/tel, new tab links, or anchor sections
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.includes("#") ||
        targetAttr === "_blank"
      ) {
        return;
      }

      // Check for normal click behavior (no modifier key, left mouse click)
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      e.preventDefault();

      // Avoid transitioning if already on target page
      if (href === pathname) return;

      // Trigger enter curtain wipe
      setPendingUrl(href);
      setTransitionStage("entering");
    };

    window.addEventListener("click", handleLinkClick);
    return () => window.removeEventListener("click", handleLinkClick);
  }, [pathname]);

  // Handle page load after curtain covers screen
  const handleEnterComplete = () => {
    if (pendingUrl) {
      router.push(pendingUrl);
    }
  };

  // Detect route change completed and trigger curtain exit reveal
  useEffect(() => {
    if (transitionStage === "entering") {
      setTransitionStage("exiting");
      setPendingUrl(null);
    }
  }, [pathname]);

  const handleExitComplete = () => {
    setTransitionStage("idle");
  };

  return (
    <>
      {/* Cinematic loading intro reveal */}
      <IntroSequence onComplete={() => setIntroActive(false)} />

      {/* Cinematic morphing page transition screen overlay */}
      <PageTransition 
        stage={transitionStage}
        onEnterComplete={handleEnterComplete}
        onExitComplete={handleExitComplete}
      />

      {/* Main site layout container that fades in after the intro completes */}
      <div
        className="min-h-full flex flex-col flex-grow relative z-10 print:z-0 overflow-x-hidden"
        style={{
          opacity: introActive ? 0 : 1,
          pointerEvents: introActive ? "none" : "auto",
          transition: introActive ? "none" : "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {navbar}
        <div className="flex-grow flex flex-col relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col relative"
          >
            {children}
          </motion.div>
        </div>
        {footer}
      </div>
    </>
  );
}

