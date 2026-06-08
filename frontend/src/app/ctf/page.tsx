"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Award, Play, Trophy, Terminal, BookOpen } from "lucide-react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CTFPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // CTF starts on Oct 4, 2026 at 09:30 AM
    const targetDate = new Date("2026-10-04T09:30:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { name: "Reverse Engineering", count: 4, desc: "Analyze compiled binaries, crack algorithms, and unpack protected applications." },
    { name: "Web Exploitation", count: 5, desc: "Bypass authentication, exploit SSRF/SQLi, audit API vulnerabilities, and leak system files." },
    { name: "Cryptography", count: 4, desc: "Decrypt custom ciphers, exploit broken RSA implementations, and break hash collisions." },
    { name: "Binary Exploitation / Pwn", count: 4, desc: "Exploit stack overflows, perform format-string leaks, and write shellcode." },
    { name: "Forensics & OSINT", count: 3, desc: "Inspect network packet dumps, search memory files, and harvest public intelligence." },
  ];

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 bg-[#030303] relative">
      {/* Laser green/cyan top ambient lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[200px] bg-thunder-cyan/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Link */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-500 hover:text-thunder-cyan transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>RETURN_TO_HOME</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Capture The Flag <span className="text-thunder-cyan">(CTF)</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-lg">
                Enter the sandbox. Test your offensive cybersecurity skills in our annual jeopardy-style hacking challenge. Solve technical tasks, claim flags, and top the leaderboard.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-yellow-400 bg-yellow-400/5 px-4 py-2 rounded-xl border border-yellow-400/20 max-w-max">
              <ShieldAlert className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
              <span>Registration Open</span>
            </div>
          </div>
          <div className="w-12 h-1 bg-thunder-blue rounded-full" />
        </div>

        {/* Countdown to CTF Start */}
        {isMounted && (
          <div className="p-8 rounded-2xl border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-md max-w-xl mx-auto text-center space-y-4 shadow-glow-cyan">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Countdown to Hacking Start
            </span>
            <div className="flex justify-center space-x-4">
              {[
                { label: "HOURS", value: timeLeft.hours },
                { label: "MINS", value: timeLeft.minutes },
                { label: "SECS", value: timeLeft.seconds },
              ].map((t, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="font-mono text-3xl md:text-4xl font-black text-white tracking-widest leading-none drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                    {String(t.value).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 mt-2 tracking-wider">{t.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Event begins on Day 2 of the summit (Oct 4, 2026) at 09:30 AM IST.
            </p>
          </div>
        )}

        {/* Prize Pool Panel */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 tracking-wider pb-2 border-b border-white/5">
            <Trophy className="w-4.5 h-4.5 text-yellow-400" />
            <span>Prize Pool Rewards</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1st */}
            <div className="group relative rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 backdrop-blur-sm flex flex-col justify-between min-h-[180px]">
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-wider text-yellow-400">1st Place</span>
                <h3 className="text-2xl font-bold text-white">INR 30,000</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Includes Premium Hardware bypass kit, Certified Winner badge, and corporate interview skips.
                </p>
              </div>
              <div className="mt-4 flex items-center text-[10px] font-mono text-yellow-400">
                <Award className="w-4 h-4 mr-1.5" /> 1st Place Reward
              </div>
            </div>

            {/* 2nd */}
            <div className="group relative rounded-2xl border border-slate-400/20 bg-slate-400/5 p-6 backdrop-blur-sm flex flex-col justify-between min-h-[180px]">
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-wider text-slate-300">2nd Place</span>
                <h3 className="text-2xl font-bold text-white">INR 15,000</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Includes Advanced lockpicking toolkit, runner-up credentials, and partner merchandise bags.
                </p>
              </div>
              <div className="mt-4 flex items-center text-[10px] font-mono text-slate-300">
                <Award className="w-4 h-4 mr-1.5" /> 2nd Place Reward
              </div>
            </div>

            {/* 3rd */}
            <div className="group relative rounded-2xl border border-amber-600/20 bg-amber-600/5 p-6 backdrop-blur-sm flex flex-col justify-between min-h-[180px]">
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-wider text-amber-600">3rd Place</span>
                <h3 className="text-2xl font-bold text-white">INR 10,000</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Includes pocket lockpicking set, physical certificates, and event sponsor vouchers.
                </p>
              </div>
              <div className="mt-4 flex items-center text-[10px] font-mono text-amber-600">
                <Award className="w-4 h-4 mr-1.5" /> 3rd Place Reward
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 tracking-wider pb-2 border-b border-white/5">
            <Terminal className="w-4 h-4 text-thunder-cyan" />
            <span>Challenge Categories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-200">{c.name}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-sm">{c.desc}</p>
                </div>
                <span className="text-[10px] font-mono text-thunder-cyan border border-white/5 bg-white/2 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {c.count} TASKS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTF Rules */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 tracking-wider pb-2 border-b border-white/5">
            <BookOpen className="w-4.5 h-4.5 text-thunder-blue" />
            <span>Rules & Regulations</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-[#070913]/30 backdrop-blur-sm text-xs font-mono text-slate-400 space-y-4">
            <div className="flex items-start space-x-2.5">
              <span className="text-thunder-cyan font-bold">[1]</span>
              <p>Teams can consist of 1 to 4 members. All registrations must be completed prior to start time.</p>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="text-thunder-cyan font-bold">[2]</span>
              <p>Flags are formatted as <code className="text-thunder-cyan">tcconf2026&#123;string&#125;</code>. Pay close attention to spelling and offsets.</p>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="text-thunder-cyan font-bold">[3]</span>
              <p>Attacking the scoring infrastructure or hosting servers is strictly forbidden and results in immediate disqualification.</p>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="text-thunder-cyan font-bold">[4]</span>
              <p>Sharing flags or solutions with other teams is prohibited. Maintain individual/team isolation loops.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
