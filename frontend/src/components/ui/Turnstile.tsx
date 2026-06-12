"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

interface TurnstileProps {
  onVerify: (verified: boolean, token: string) => void;
}

export default function Turnstile({ onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADjiMXDrT_CEWOcO";

  useEffect(() => {
    const renderWidget = () => {
      const turnstile = (window as any).turnstile;
      if (turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          const id = turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "dark",
            callback: (token: string) => {
              onVerify(true, token);
            },
            "expired-callback": () => {
              onVerify(false, "");
            },
            "error-callback": () => {
              onVerify(false, "");
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      }
    };

    if ((window as any).turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (err) {
          // ignore
        }
      }
    };
  }, [onVerify]);

  const handleScriptLoad = () => {
    const turnstile = (window as any).turnstile;
    if (turnstile && containerRef.current && !widgetIdRef.current) {
      try {
        const id = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => {
            onVerify(true, token);
          },
          "expired-callback": () => {
            onVerify(false, "");
          },
          "error-callback": () => {
            onVerify(false, "");
          },
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.error("Turnstile render error on load:", err);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
        Verification Challenge
      </label>
      <div className="flex justify-center p-4 rounded-xl border border-white/5 bg-[#0d0d10]/60 min-h-[80px] items-center">
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={handleScriptLoad}
        />
        <div ref={containerRef} id="turnstile-container" className="mx-auto" />
      </div>
    </div>
  );
}
