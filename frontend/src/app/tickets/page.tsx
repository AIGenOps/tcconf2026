"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Shield, Award, Sparkles, Terminal, CreditCard, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  desc: string;
  features: string[];
  badge?: string;
  color: string;
}

export default function TicketsPage() {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "form" | "loading" | "success">("idle");
  const [ticketNumber, setTicketNumber] = useState("");

  const pricingTiers: PricingTier[] = [
    {
      id: "student",
      name: "Student Pass",
      price: "₹499",
      desc: "Requires a valid student ID card for registration check-in.",
      features: [
        "Access to both days of presentations",
        "Entry to Hacking Villages",
        "Participation in CTF event",
        "Digital Certificate of Attendance",
        "Snacks and beverages included",
      ],
      color: "border-slate-400/20 text-slate-400",
    },
    {
      id: "pro",
      name: "Professional Pass",
      price: "₹1,499",
      desc: "Standard entrance ticket for industry professionals & developers.",
      features: [
        "All features of the Student Pass",
        "Entrance to premium workshops",
        "Dedicated corporate networking lunch",
        "Physical badge and merchandise kit",
        "Direct company talent board access",
      ],
      badge: "RECOMMENDED",
      color: "border-thunder-blue/40 text-thunder-blue shadow-glow-blue",
    },
    {
      id: "vip",
      name: "VIP Elite Pass",
      price: "₹3,999",
      desc: "Exclusive entrance pass for corporate teams, CXOs, and founders.",
      features: [
        "All features of the Professional Pass",
        "Reserved front-row seating in keynotes",
        "Exclusive invite to the CXO Dinner",
        "1-on-1 speaker meetups access",
        "Lifetime Slack alum network access",
      ],
      badge: "LIMITED",
      color: "border-thunder-cyan/40 text-thunder-cyan shadow-glow-cyan",
    },
  ];

  const handlePurchaseClick = (tier: PricingTier) => {
    setSelectedTier(tier);
    setCheckoutStep("form");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    // Generate mock ticket number
    const num = `tc-tix-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketNumber(num);
    setCheckoutStep("success");

    // Fire confetti burst
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#0052ff", "#00f0ff", "#ffffff"],
    });
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 bg-[#030303] relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-500 hover:text-thunder-cyan transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>RETURN_TO_HOME</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Get Your Conference Pass
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Secure your entrance to ThunderCipher Conference 2026. Choose a ticket tier that matches your profile. Limited seats available.
            </p>
          </div>
          <div className="w-12 h-1 bg-thunder-blue rounded-full" />
        </div>

        {/* Urgency Indicators Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-xs font-mono">
          <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c]/60 flex items-center justify-between">
            <span className="text-slate-400">AVAILABLE_SEATS_REMAINING:</span>
            <span className="text-thunder-cyan font-bold animate-pulse">42 / 400</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c]/60 flex items-center justify-between">
            <span className="text-slate-400">EARLY_BIRD_DISCOUNT:</span>
            <span className="text-emerald-400 font-bold">ACTIVE (25% OFF APPLIED)</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative overflow-hidden rounded-2xl border bg-[#0a0a0c]/50 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${tier.color}`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[8px] font-mono font-bold tracking-widest text-slate-200">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-sans">{tier.name}</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-sans">{tier.desc}</p>
                </div>

                {/* Price */}
                <div className="py-2 border-y border-white/5">
                  <span className="text-4xl font-extrabold text-white font-mono">{tier.price}</span>
                  <span className="text-slate-500 text-xs font-mono ml-1">/ PASS</span>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-thunder-cyan mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase button */}
              <button
                onClick={() => handlePurchaseClick(tier)}
                className="w-full mt-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300 border border-thunder-blue/40"
              >
                Get {tier.name.split(" ")[0]} Pass
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Simulated Gateway Modal */}
      {checkoutStep !== "idle" && selectedTier && (
        <div className="fixed inset-0 z-50 bg-[#030303]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/5 bg-[#0a0a0c] p-6 md:p-8 overflow-hidden shadow-glow-blue">
            
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-4 border-b border-white/5 mb-6">
              <span>Secure Checkout</span>
              <span className="flex items-center text-thunder-cyan text-[10px] font-mono">
                <Shield className="w-3.5 h-3.5 mr-1" /> Simulated Gateway
              </span>
            </div>

            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Purchase Summary</h3>
                  <p className="text-slate-400 text-xs font-mono">
                    Tier: <span className="text-thunder-cyan">{selectedTier.name}</span> | Price: <span className="text-thunder-cyan">{selectedTier.price}</span>
                  </p>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@domain.com"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Simulation check warning */}
                <div className="p-3.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-500 leading-normal">
                  Note: This checkout process is simulated. No real transaction will occur.
                </div>

                {/* CTA buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("idle")}
                    className="flex-1 py-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/2 text-slate-300 hover:text-white transition-all text-xs font-bold font-mono tracking-widest uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 rounded-xl bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center space-x-1.5 border border-thunder-blue/40 transition-all"
                  >
                    <span>Pay {selectedTier.price}</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === "loading" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                {/* Rotating Spinner */}
                <div className="w-10 h-10 border-2 border-thunder-blue border-t-thunder-cyan rounded-full animate-spin" />
                <span className="text-xs font-mono text-slate-400 tracking-widest uppercase animate-pulse">
                  Processing payment...
                </span>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Transaction Verified</h3>
                  <p className="text-slate-400 text-xs font-sans max-w-xs mx-auto">
                    Pass successfully registered. We have sent the confirmation invoice and QR check-in code to <span className="text-thunder-cyan">{email}</span>.
                  </p>
                </div>

                {/* Generated Ticket box */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/2 text-xs text-slate-300 text-left space-y-1.5 max-w-sm mx-auto">
                  <div>Ticket ID: <span className="text-thunder-cyan font-bold font-mono">{ticketNumber}</span></div>
                  <div>Pass Type: <span className="text-thunder-cyan uppercase font-semibold">{selectedTier.name}</span></div>
                  <div>Attendee Name: <span className="text-slate-200 font-semibold">{name}</span></div>
                  <div>Reference Code: <span className="font-mono text-[10px] text-slate-500">rzp_sim_{Math.random().toString(36).substring(4, 12)}</span></div>
                </div>

                <button
                  onClick={() => setCheckoutStep("idle")}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all text-xs font-bold font-mono tracking-widest uppercase"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
