"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Award, ExternalLink } from "lucide-react";

export default function SponsorPage() {
  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 bg-[#030303] relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Return link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-500 hover:text-thunder-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN_TO_HOME</span>
          </Link>
        </div>

        {/* Sponsor Content Section */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
              SPONSOR US
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Sponsor ThunderCipher 2026
            </h1>
            <div className="w-16 h-1 bg-thunder-blue rounded-full mt-4" />
          </div>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
            ThunderCipher is the premier cybersecurity conference in the region, bringing together top security researchers, industry professionals, developers, and defense experts. Partnering with us offers a unique opportunity to showcase your brand, recruit elite cybersecurity talent, and support the open security community.
          </p>
        </div>

        {/* Interactive Sponsor Card */}
        <div className="glass-panel border border-white/5 rounded-2xl bg-[#070913]/30 p-8 md:p-12 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-thunder-blue/10 border border-thunder-blue/20 text-thunder-cyan mb-2">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Sponsorship Inquiry Form
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Sponsorship packages are available across multiple tiers (Bronze, Silver, Gold, Platinum, and Title). To receive our comprehensive sponsorship prospectus or discuss custom branding opportunities, please submit our sponsorship form.
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeMf0sDCb4mV51r-HrVYHUxsq13HthTRfxh9KpIZraX7k6Hqg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-sm font-bold tracking-wider uppercase bg-thunder-blue text-white shadow-glow-blue hover:bg-thunder-blue/90 transition-all duration-300 transform hover:-translate-y-0.5 border border-thunder-blue/50 whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Sponsor Us</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors space-y-3">
            <div className="text-thunder-cyan font-bold text-sm tracking-widest font-mono uppercase">
              Brand Visibility
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Showcase your security products, tools, and platforms directly to a highly targeted audience of developers, operators, and cyber professionals.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors space-y-3">
            <div className="text-thunder-cyan font-bold text-sm tracking-widest font-mono uppercase">
              Talent Acquisition
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Connect with leading security candidates, CTF players, and researchers during the hiring village and recruitment networking tracks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors space-y-3">
            <div className="text-thunder-cyan font-bold text-sm tracking-widest font-mono uppercase">
              Community Support
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Support the next generation of cybersecurity defenders by enabling hacking villages, lockpicking labs, and regional security training.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
