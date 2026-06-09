"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    VANTA: any;
  }
}

export default function LiquidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    let effect: any = null;

    const startVanta = () => {
      if (window.VANTA && window.VANTA.TOPOLOGY && containerRef.current && !effect) {
        try {
          effect = window.VANTA.TOPOLOGY({
            el: containerRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x0052ff, // Bright blue matching brand accents
            backgroundColor: 0x030303, // Match site background
          });
          setVantaEffect(effect);
        } catch (err) {
          console.error("Vanta topology init failed:", err);
        }
      }
    };

    const loadScript = (id: string, src: string, callback: () => void) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (script) {
        // If the script is already loaded, fire callback immediately or when it loads
        if (script.dataset.loaded === "true" || (id === "p5-js" && window.hasOwnProperty("p5")) || (id === "vanta-topology" && window.VANTA?.TOPOLOGY)) {
          callback();
        } else {
          script.addEventListener("load", callback);
        }
        return;
      }

      script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        callback();
      };
      document.body.appendChild(script);
    };

    // Load p5 first, then load vanta topology
    loadScript("p5-js", "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js", () => {
      loadScript("vanta-topology", "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js", () => {
        startVanta();
      });
    });

    return () => {
      if (effect) {
        effect.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ backgroundColor: "#030303" }}
    />
  );
}
