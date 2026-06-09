"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ShieldAlert, Cpu, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#030303]/90 backdrop-blur-md pt-16 pb-8 px-6 md:px-8 mt-auto">
      {/* Decorative radial ambient light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-thunder-blue/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <a href="https://thundercipher.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 group">
            <span className="font-mono text-sm font-bold tracking-wider text-slate-200 group-hover:text-white transition-colors">
              THUNDER<span className="text-thunder-cyan group-hover:text-thunder-cyan/85">CIPHER</span>
            </span>
          </a>
          <p className="text-slate-400 text-xs leading-relaxed">
            Your gateway to mastering offensive security. Access real-world labs, track your progress, and elevate your cybersecurity journey.
          </p>
        </div>

        {/* Navigation Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-300">EXPLORE</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/speakers" className="text-slate-400 hover:text-white transition-colors">
                Speakers & Keynotes
              </Link>
            </li>
            <li>
              <Link href="/schedule" className="text-slate-400 hover:text-white transition-colors">
                Schedule & Workshops
              </Link>
            </li>
            <li>
              <Link href="/ctf" className="text-slate-400 hover:text-white transition-colors">
                CTF Challenge
              </Link>
            </li>
            <li>
              <Link href="/tickets" className="text-slate-400 hover:text-white transition-colors">
                Get Tickets
              </Link>
            </li>
          </ul>
        </div>

        {/* Engagement Forms Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-300">COLLABORATE</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact Form
              </Link>
            </li>
            <li>
              <Link href="/sponsor" className="text-slate-400 hover:text-white transition-colors">
                Sponsor Us
              </Link>
            </li>
            <li>
              <Link href="/partner" className="text-slate-400 hover:text-white transition-colors">
                Partner with Us
              </Link>
            </li>
            <li>
              <Link href="/volunteer" className="text-slate-400 hover:text-white transition-colors">
                Volunteer Openings
              </Link>
            </li>
          </ul>
        </div>

        {/* Venue Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-300">VENUE</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Sharda University Campus<br />
            Plot No. 32-34, Knowledge Park III<br />
            Greater Noida, Uttar Pradesh, India
          </p>
          <div className="text-[10px] text-slate-400">
            Dates: <span className="text-thunder-cyan">03 - 04 October 2026</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Details section */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
        <div>
          &copy; 2026 ThunderCipher All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
