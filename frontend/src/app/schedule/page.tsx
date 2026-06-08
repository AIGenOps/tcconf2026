"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSchedule, ScheduleItem } from "@/lib/sanity";
import { ArrowLeft, Clock, Printer, Globe, Calendar, Terminal } from "lucide-react";

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [timezone, setTimezone] = useState<"IST" | "LOCAL">("IST");
  const [localOffset, setLocalOffset] = useState("");
  
  // Simulation variables
  const [simulateLive, setSimulateLive] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState("11:00 AM"); // Simulated for Day 1

  useEffect(() => {
    async function loadData() {
      const data = await getSchedule(activeDay);
      setScheduleData(data);
    }
    loadData();
  }, [activeDay]);

  useEffect(() => {
    // Calculate browser offset
    const offsetMin = -new Date().getTimezoneOffset();
    const hrs = Math.floor(Math.abs(offsetMin) / 60);
    const mins = Math.abs(offsetMin) % 60;
    const sign = offsetMin >= 0 ? "+" : "-";
    setLocalOffset(`GMT${sign}${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Helper to convert IST string (e.g., "10:30 AM") to local browser time
  const formatTime = (timeStr: string) => {
    if (timezone === "IST") return timeStr;

    // Split "09:00 AM - 10:00 AM"
    const parts = timeStr.split(" - ");
    if (parts.length !== 2) return timeStr;

    const convertSingle = (singleTime: string) => {
      try {
        const [time, modifier] = singleTime.split(" ");
        let [hoursStr, minutesStr] = time.split(":");
        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        // Create a date object representing Oct 3, 2026 at that IST time (IST is GMT+5:30)
        // Set year to 2026, month 9 (Oct), day 3
        const dateIST = new Date(Date.UTC(2026, 9, 3, hours - 5, minutes - 30));
        
        return dateIST.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        return singleTime;
      }
    };

    return `${convertSingle(parts[0])} - ${convertSingle(parts[1])}`;
  };

  // Check if a schedule slot is currently active
  const isCurrentSlot = (timeStr: string) => {
    if (!simulateLive) return false;

    // Compare with simulatedTime "11:00 AM"
    // e.g. "10:30 AM - 11:30 AM" includes 11:00 AM
    const parts = timeStr.split(" - ");
    if (parts.length !== 2) return false;

    const parseToMin = (t: string) => {
      const [val, mod] = t.split(" ");
      let [h, m] = val.split(":").map(Number);
      if (mod === "PM" && h < 12) h += 12;
      if (mod === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    const start = parseToMin(parts[0]);
    const end = parseToMin(parts[1]);
    const sim = parseToMin(simulatedTime);

    return sim >= start && sim < end;
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 bg-[#030303] print:bg-white print:text-black relative">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden" />

      <div className="max-w-4xl mx-auto space-y-12 print:space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs font-mono text-slate-500 hover:text-thunder-cyan transition-colors"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Back to Home</span>
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Timeline & Schedule
              </h1>
              <p className="text-slate-400 text-sm max-w-lg">
                Plan your days at ThunderCipher. Day 1 focuses on Red Teaming & Offensive labs; Day 2 highlights Blue Team defense, smart-contract exploits, and CTF distribution.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            {/* Timezone Toggle */}
            <button
              onClick={() => setTimezone(timezone === "IST" ? "LOCAL" : "IST")}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-slate-300 hover:text-white transition-all duration-300"
            >
              <Globe className="w-4 h-4 text-thunder-cyan" />
              <span>Timezone: {timezone === "IST" ? "IST (GMT+5:30)" : `Local (${localOffset})`}</span>
            </button>

            {/* Print / PDF Trigger */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-slate-300 hover:text-white transition-all duration-300"
            >
              <Printer className="w-4 h-4 text-thunder-blue" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Live Simulator Panel */}
        <div className="p-4 rounded-2xl border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono print:hidden">
          <div className="flex items-center space-x-3">
            <Terminal className="w-4 h-4 text-thunder-cyan" />
            <span className="text-slate-300">Simulate Live Tracking:</span>
            <button
              onClick={() => setSimulateLive(!simulateLive)}
              className={`px-3 py-1 rounded-md border text-[10px] font-bold transition-all ${
                simulateLive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              {simulateLive ? "ON" : "OFF"}
            </button>
          </div>
          {simulateLive && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Set Time:</span>
              <select
                value={simulatedTime}
                onChange={(e) => setSimulatedTime(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-300 focus:outline-none"
              >
                <option value="09:30 AM">09:30 AM (Reg)</option>
                <option value="11:00 AM">11:00 AM (Keynote)</option>
                <option value="12:00 PM">12:00 PM (Workshop)</option>
                <option value="02:30 PM">02:30 PM (Villages)</option>
                <option value="04:30 PM">04:30 PM (Closing)</option>
              </select>
            </div>
          )}
        </div>

        {/* Day selection tabs */}
        <div className="flex items-center justify-center p-1 bg-white/2 border border-white/5 rounded-2xl max-w-xs mx-auto print:hidden">
          <button
            onClick={() => setActiveDay(1)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all ${
              activeDay === 1 ? "bg-thunder-blue text-white shadow-glow-blue" : "text-slate-400 hover:text-white"
            }`}
          >
            Day 01 — Oct 3
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all ${
              activeDay === 2 ? "bg-thunder-blue text-white shadow-glow-blue" : "text-slate-400 hover:text-white"
            }`}
          >
            Day 02 — Oct 4
          </button>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">ThunderCipher Conference 2026</h1>
          <p className="text-xs text-gray-600">Sharda University | Oct 3 - Oct 4, 2026</p>
          <p className="text-[10px] text-gray-500 mt-1">Official Timeline Schedule — Day {activeDay}</p>
        </div>

        {/* Timeline List */}
        <div className="relative border-l border-white/10 ml-4 pl-6 md:pl-8 space-y-8 py-4 print:border-gray-300 print:ml-2">
          {scheduleData.map((item, index) => {
            const isLive = isCurrentSlot(item.time);
            return (
              <div key={index} className="relative group">
                
                {/* Timeline node */}
                <div
                  className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-colors duration-300 print:border-gray-400 print:bg-white ${
                    isLive
                      ? "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"
                      : "bg-[#030303] border-white/10 group-hover:border-thunder-cyan"
                  }`}
                />

                {/* Main Card */}
                <div
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isLive
                      ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                      : "bg-[#070913]/30 border-white/5 hover:border-white/10 backdrop-blur-sm"
                  } print:border-none print:p-2`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    
                    {/* Time readout */}
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 print:text-black">
                      <Clock className="w-3.5 h-3.5 text-thunder-cyan print:text-black" />
                      <span className="font-semibold">{formatTime(item.time)}</span>
                    </div>

                    {/* Status / Category tag */}
                    <div className="flex items-center space-x-2">
                      {isLive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-widest bg-emerald-500/10 text-emerald-400 uppercase animate-pulse border border-emerald-500/20 print:hidden">
                          LIVE
                        </span>
                      )}
                      <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-widest bg-white/5 border border-white/5 text-slate-400 uppercase print:border-gray-300 print:text-gray-600">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-white group-hover:text-thunder-cyan transition-colors print:text-black print:text-sm">
                    {item.title}
                  </h3>

                  {/* Speaker */}
                  {item.speaker && (
                    <div className="mt-3 text-xs text-slate-400 font-sans print:text-gray-700">
                      Speaker: <span className="text-slate-200 font-semibold print:text-black">{item.speaker}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
