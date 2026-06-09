"use client";

import React, { useEffect, useRef } from "react";

export default function LiquidBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vantaEffect: any = null;

    const loadScripts = async () => {
      // 1. Load p5.min.js from CDN if not already loaded globally
      if (!(window as any).p5) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.head.appendChild(script);
        });
      }

      // 2. Load vanta.topology.min.js from CDN if not already loaded globally
      if (!(window as any).VANTA || !(window as any).VANTA.TOPOLOGY) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.head.appendChild(script);
        });
      }

      // 3. Initialize the Vanta Topology background effect
      if (vantaRef.current && (window as any).VANTA && (window as any).VANTA.TOPOLOGY) {
        vantaEffect = (window as any).VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          backgroundColor: 0x030303,
          color: 0x0052ff, // Hex equivalent for --thunder-blue (#0052ff)
        });
      }
    };

    loadScripts().catch((err) => {
      console.error("Failed to load Vanta.js scripts:", err);
    });

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ backgroundColor: "#030303" }}
    />
  );
}
