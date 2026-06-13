"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, BookOpen01Icon, CpuIcon, Trophy, RocketIcon, TerminalIcon } from "@hugeicons/core-free-icons";

interface CardItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function GlowCard({ icon, title, description }: CardItem) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:border-thunder-blue/30 flex flex-col justify-between min-h-[260px] group"
    >
      {/* Dynamic Cursor Light Spot */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition duration-300 rounded-2xl"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(0, 82, 255, 0.15), transparent 80%)`,
          }}
        />
      )}

      {/* Glow highlight circle */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl border border-thunder-blue/20"
        style={{
          maskImage: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
        }}
      />

      <div className="relative z-10 flex flex-col space-y-4">
        {/* Icon container */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl max-w-max text-thunder-cyan transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.2)]">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold tracking-wide text-white font-sans">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-slate-200 text-sm leading-relaxed font-sans">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function WhyAttend() {
  const cards: CardItem[] = [
    {
      icon: <HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5" />,
      title: "Premium Networking",
      description: "Connect with 400+ researchers, developers, developers, and security professionals. Share ideas, form teams, and expand your professional cyber-defense network.",
    },
    {
      icon: <HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5" />,
      title: "Interactive Learning",
      description: "Dive deep into modern attack methodologies, defensive countermeasures, cloud architecture security, and IoT firmware analysis led by experienced industry speakers.",
    },
    {
      icon: <HugeiconsIcon icon={CpuIcon} className="w-5 h-5" />,
      title: "Hands-on Workshops",
      description: "Gain practical experience in sandboxed environments. Take part in guided defense setups, code audits, container security configuration, and live red-teaming scenarios.",
    },
    {
      icon: <HugeiconsIcon icon={Trophy} className="w-5 h-5" />,
      title: "Dedicated CTF Challenge",
      description: "Test your skills in our themed Capture The Flag event. Solve reverse engineering, web exploitation, binary analysis, and cryptography challenges to win premium prizes.",
    },
    {
      icon: <HugeiconsIcon icon={RocketIcon} className="w-5 h-5" />,
      title: "Interactive Villages",
      description: "Explore diverse specialized villages: lockpicking, hardware hacking, social engineering, and cloud security labs. Get hands-on with real devices and chipsets.",
    },
    {
      icon: <HugeiconsIcon icon={TerminalIcon} className="w-5 h-5" />,
      title: "Career & Growth",
      description: "Meet sponsoring enterprises, recruitment boards, and security firms looking for skilled developers. Pitch projects and discover new industry positions.",
    },
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 md:px-8" id="why-attend">
      {/* Title block */}
      <div className="text-center space-y-3 mb-16 scroll-reveal">
        <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
          CONFERENCE OVERVIEW
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Why Attend ThunderCipher 2026?
        </h2>
        <div className="w-12 h-1 bg-thunder-blue mx-auto rounded-full mt-4" />
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal">
        {cards.map((card, index) => (
          <GlowCard
            key={index}
            icon={card.icon}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
}
