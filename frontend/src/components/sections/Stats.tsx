"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, motion, useMotionValue, useTransform, animate } from "framer-motion";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

function StatCounter({ value, suffix, label, sublabel }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 2.5,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, count, value]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      setDisplayValue(latest.toLocaleString());
    });
  }, [rounded]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-card border border-white/5 relative overflow-hidden group hover:border-thunder-blue/30 transition-all duration-500"
    >
      {/* Decorative hover light */}
      <div className="absolute inset-0 bg-gradient-to-b from-thunder-blue/0 to-thunder-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="font-mono text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(0,82,255,0.25)]">
          {displayValue}
          <span className="text-thunder-cyan ml-0.5">{suffix}</span>
        </span>
        <span className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase mt-4">
          {label}
        </span>
        <span className="text-xs text-slate-350 font-mono tracking-wider mt-1 uppercase">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

export default function Stats() {
  const statsList = [
    { value: 400, suffix: "+", label: "Participants", sublabel: "Attendees & Hackers" },
    { value: 15, suffix: "+", label: "Speakers", sublabel: "Industry Leaders" },
    { value: 4, suffix: "", label: "Villages", sublabel: "Interactive Labs" },
  ];

  return (
    <section className="relative z-10 max-w-5xl mx-auto py-16 px-6 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-reveal">
        {statsList.map((stat, index) => (
          <StatCounter
            key={index}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            sublabel={stat.sublabel}
          />
        ))}
      </div>
    </section>
  );
}
