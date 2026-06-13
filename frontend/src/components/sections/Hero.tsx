"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Location01Icon } from "@hugeicons/core-free-icons";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const targetDate = new Date("2026-10-03T09:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 px-4 md:px-8">
      {/* Premium subtle grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Spotlights and moving light beams */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-thunder-blue/10 via-thunder-cyan/5 to-transparent blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Date / Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs font-mono tracking-widest text-slate-300 backdrop-blur-md"
        >
          <span className="flex items-center text-thunder-cyan">
            <HugeiconsIcon icon={Calendar01Icon} className="w-3.5 h-3.5 mr-1.5" /> 3rd - 4th October 2026
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 hidden sm:inline" />
          <span className="flex items-center text-slate-300">
            <HugeiconsIcon icon={Location01Icon} className="w-3.5 h-3.5 mr-1.5" /> Sharda University
          </span>
        </motion.div>

        {/* Title */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            ThunderCipher <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-thunder-cyan drop-shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              Conference 2026
            </span>
          </motion.h1>
        </div>

        {/* Countdown Timer */}
        {isMounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md w-full mx-auto bg-[#070913]/60 border border-white/5 p-3 sm:p-4 rounded-2xl backdrop-blur-lg shadow-glow-blue"
          >
            {[
              { label: "DAYS", value: timeLeft.days },
              { label: "HOURS", value: timeLeft.hours },
              { label: "MINS", value: timeLeft.minutes },
              { label: "SECS", value: timeLeft.seconds },
            ].map((unit, idx) => (
              <div key={idx} className="flex flex-col items-center p-1.5 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 relative">
                <span className="font-mono text-xl sm:text-3xl font-bold text-white tracking-wide sm:tracking-widest leading-none drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 tracking-wider mt-1.5 sm:mt-2">
                  {unit.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-md mx-auto"
        >
          <Link
            href="/tickets"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg border border-thunder-blue/40 transition-all duration-300 text-center"
          >
            Register Now
          </Link>
          <Link
            href="/schedule"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 transition-all duration-300 text-center"
          >
            View Schedule
          </Link>
          <Link
            href="/venue"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 transition-all duration-300 text-center"
          >
            Venue Details
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
