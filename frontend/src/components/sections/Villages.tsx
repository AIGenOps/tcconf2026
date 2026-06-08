"use client";

import React from "react";
import { Cpu, Cloud, Terminal, KeyRound, ArrowRight } from "lucide-react";

interface VillageItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  labs: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
}

const mockVillages: VillageItem[] = [
  {
    id: "hardware",
    icon: <Cpu className="w-6 h-6 text-emerald-400" />,
    title: "Hardware Hacking & Lockpicking",
    description: "Learn firmware extraction, JTAG debugging, and side-channel analysis. Get hands-on with locks, lockpicks, and hardware bypass boards.",
    labs: ["JTAG Firmware Dumps", "UART Terminal Shells", "Pin Tumbler Locks", "Bypass Toolkits"],
    difficulty: "All Levels",
  },
  {
    id: "cloud",
    icon: <Cloud className="w-6 h-6 text-sky-400" />,
    title: "Cloud & Kubernetes Security",
    description: "Explore misconfigured Kubernetes clusters, container escape tactics, AWS IAM privilege escalation, and modern CI/CD hijacking loops.",
    labs: ["Kubernetes ESCAPE-9", "IAM Privilege Escalation", "Docker Socket Hijack", "GitHub Actions Attacks"],
    difficulty: "Intermediate",
  },
  {
    id: "redteam",
    icon: <Terminal className="w-6 h-6 text-red-400" />,
    title: "Red Teaming & Active Directory",
    description: "Attack domain controllers, bypass Endpoint Detection and Response (EDR) agents, perform ticket harvesting, and simulate malware droppers.",
    labs: ["Kerberoasting Attacks", "EDR Bypass Techniques", "Token Manipulation", "LSA Secrets Extraction"],
    difficulty: "Advanced",
  },
  {
    id: "cryptography",
    icon: <KeyRound className="w-6 h-6 text-purple-400" />,
    title: "Web3 & Smart Contract Audit",
    description: "Audit Ethereum/Solidity contracts, exploit reentrancy bugs, audit flash loan vulnerabilities, and bypass multi-signature validation models.",
    labs: ["Reentrancy Attacks", "Flash Loan Exploits", "Sign Bypass Audits", "Oracle Manipulation"],
    difficulty: "Advanced",
  },
];

export default function Villages() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto py-20 px-6 md:px-8" id="villages">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 scroll-reveal">
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
            Hands-On Hubs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive Hacking Villages
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Step away from slides and slides. Try real lockpicking tools, hardware bypass boards, smart-contract exploits, and container escape scenarios in guided labs.
          </p>
        </div>
        <div className="w-12 h-1 bg-thunder-blue rounded-full md:hidden" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-reveal">
        {mockVillages.map((village) => (
          <div
            key={village.id}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#070913]/30 p-8 backdrop-blur-sm transition-all duration-300 hover:border-thunder-blue/30 flex flex-col justify-between"
          >
            {/* Spotlight background hover */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-thunder-blue/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="space-y-6">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl max-w-max drop-shadow-sm">
                  {village.icon}
                </div>
                <span className="text-[9px] font-mono tracking-widest text-slate-500 border border-white/5 px-2.5 py-1 rounded-full bg-white/2">
                  {village.difficulty}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-wide text-white group-hover:text-thunder-cyan transition-colors">
                  {village.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {village.description}
                </p>
              </div>

              {/* Labs List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Lab Scenarios
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {village.labs.map((lab, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300 font-mono">
                      <span className="w-1 h-1 rounded-full bg-thunder-cyan" />
                      <span>{lab}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span>Village Code: {village.id.toUpperCase()}</span>
              <span className="flex items-center text-thunder-blue group-hover:text-white transition-colors duration-300 cursor-pointer font-semibold">
                Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
