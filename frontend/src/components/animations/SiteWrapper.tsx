"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import IntroSequence from "./IntroSequence";

interface SiteWrapperProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function SiteWrapper({ children, navbar, footer }: SiteWrapperProps) {
  const pathname = usePathname();
  const isMainPage = pathname === "/";
  const [introActive, setIntroActive] = useState(isMainPage);

  // Reset intro state to active whenever route/pathname changes (only on homepage)
  useEffect(() => {
    if (pathname === "/") {
      setIntroActive(true);
    } else {
      setIntroActive(false);
    }
  }, [pathname]);

  return (
    <>
      {/* Cinematic loading intro reveal */}
      <IntroSequence onComplete={() => setIntroActive(false)} />

      {/* Main site layout container that fades in after the intro completes */}
      <div
        className="min-h-full flex flex-col flex-grow relative z-10 print:z-0"
        style={{
          opacity: introActive ? 0 : 1,
          pointerEvents: introActive ? "none" : "auto",
          transition: introActive ? "none" : "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {navbar}
        <div className="flex-grow flex flex-col relative">
          {children}
        </div>
        {footer}
      </div>
    </>
  );
}
