"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Sparkles, Zap, Users, ArrowUpRight, Plus } from "lucide-react";
import { getSponsors, getPartners, Sponsor, Partner } from "@/lib/sanity";

// Proper corporate styled SVG logo components
const SentinelLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="20" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1">SentinelOne</text>
  </svg>
);

const CrowdStrikeLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="20" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1">CrowdStrike</text>
  </svg>
);

const CloudflareLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="20" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1.5">Cloudflare</text>
  </svg>
);

const SnykLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="20" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="2">Snyk</text>
  </svg>
);

const CyberArkLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="20" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1.5">CyberArk</text>
  </svg>
);

// Proper styled SVG partner logo components
const DefconDelhiLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1">DEFCON Delhi</text>
  </svg>
);

const NullNoidaLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1">null Noida</text>
  </svg>
);

const OwaspLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1.5">OWASP Student</text>
  </svg>
);

const ShardaClubLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1">Sharda Cyber Club</text>
  </svg>
);

const IsacaLogo = () => (
  <svg className="h-6 w-auto text-slate-300 group-hover:text-thunder-cyan transition-colors" viewBox="0 0 200 40" fill="currentColor">
    <text x="10" y="28" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1">ISACA Student</text>
  </svg>
);

// Helper to map logo string identifiers or corporate name strings to local custom SVGs
const getLogoComponent = (logoUrl?: string, name?: string) => {
  // If a valid uploaded photo/logo URL is provided, render the image
  if (logoUrl && (logoUrl.startsWith("http://") || logoUrl.startsWith("https://") || logoUrl.startsWith("/"))) {
    return (
      <img
        src={logoUrl}
        alt={name || "Logo"}
        className="max-h-12 max-w-[80%] w-auto object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
      />
    );
  }

  const key = (logoUrl || name || "").toLowerCase();
  
  if (key.includes("sentinel")) return <SentinelLogo />;
  if (key.includes("crowdstrike") || key.includes("crowd")) return <CrowdStrikeLogo />;
  if (key.includes("cloudflare")) return <CloudflareLogo />;
  if (key.includes("snyk")) return <SnykLogo />;
  if (key.includes("cyberark")) return <CyberArkLogo />;
  
  if (key.includes("defcon")) return <DefconDelhiLogo />;
  if (key.includes("null")) return <NullNoidaLogo />;
  if (key.includes("owasp")) return <OwaspLogo />;
  if (key.includes("sharda")) return <ShardaClubLogo />;
  if (key.includes("isaca")) return <IsacaLogo />;

  // Default clean text logo card fallback if no custom SVG matches
  return (
    <div className="text-slate-300 font-bold text-base font-sans tracking-wide text-center uppercase group-hover:text-thunder-cyan transition-colors">
      {name}
    </div>
  );
};

interface SponsorsProps {
  initialSponsors?: Sponsor[];
  initialPartners?: Partner[];
}

export default function Sponsors({ initialSponsors, initialPartners }: SponsorsProps) {
  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>(initialSponsors || []);
  const [partnersList, setPartnersList] = useState<Partner[]>(initialPartners || []);

  useEffect(() => {
    if (initialSponsors && initialPartners) {
      setSponsorsList(initialSponsors);
      setPartnersList(initialPartners);
    } else {
      async function loadData() {
        const [sponsorsData, partnersData] = await Promise.all([
          getSponsors(),
          getPartners(),
        ]);
        setSponsorsList(sponsorsData);
        setPartnersList(partnersData);
      }
      loadData();
    }
  }, [initialSponsors, initialPartners]);

  return (
    <section className="relative z-10 py-24 px-6 md:px-8 border-t border-white/5" id="sponsors">
      {/* Title */}
      <div className="text-center space-y-3 mb-20 scroll-reveal">
        <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
          OUR SUPPORTERS
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Sponsors & Industry Partners
        </h2>
        <div className="w-12 h-1 bg-thunder-blue mx-auto rounded-full mt-4" />
      </div>

      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Sponsors Grid Section */}
        <div className="space-y-8">
          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] tracking-widest uppercase justify-center">
            <Shield className="w-4 h-4 text-thunder-blue" />
            <span>CONFIRMED SUMMIT SPONSORS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal">
            {sponsorsList.map((sp, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-white/5 bg-[#070913]/30 backdrop-blur-md transition-all duration-300 hover:border-thunder-blue/40 shadow-sm hover:shadow-[0_0_20px_rgba(0,82,255,0.1)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-thunder-blue/0 to-thunder-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Logo container */}
                <div className="relative z-10 flex items-center justify-center h-24 bg-white/2 border border-white/5 rounded-xl mb-4 group-hover:bg-white/5 transition-all px-4">
                  {getLogoComponent(sp.logoUrl, sp.name)}
                </div>

                {/* Info and Link */}
                <div className="relative z-10 flex items-center justify-between text-xs mt-2">
                  <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{sp.name}</span>
                  <a
                    href={sp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-thunder-cyan hover:underline hover:text-white transition-all"
                  >
                    <span>Visit Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}

            {/* Sponsor Us CTA Card inside grid */}
            <div
              className="group relative flex flex-col justify-center p-6 rounded-2xl border border-dashed border-thunder-blue/30 bg-thunder-blue/5 backdrop-blur-md transition-all duration-300 hover:border-thunder-blue hover:bg-thunder-blue/10 overflow-hidden text-center min-h-[170px]"
            >
              <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                <div className="p-2.5 rounded-full bg-thunder-blue/10 border border-thunder-blue/20 text-thunder-cyan">
                  <Plus className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sponsor Us</h4>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">Promote your brand at the elite cybersecurity event.</p>
                </div>
                <Link
                  href="/sponsor"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-bold font-mono tracking-widest uppercase bg-thunder-blue text-white border border-thunder-blue/40 shadow-glow-blue transition-all"
                >
                  Join as Sponsor
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Community Partners Grid Section */}
        <div className="space-y-8">
          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] tracking-widest uppercase justify-center">
            <Users className="w-4 h-4 text-thunder-cyan" />
            <span>COMMUNITY & ACADEMIC PARTNERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal">
            {partnersList.map((pt, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-white/5 bg-[#070913]/30 backdrop-blur-md transition-all duration-300 hover:border-thunder-cyan/40 shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-thunder-cyan/0 to-thunder-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Logo container */}
                <div className="relative z-10 flex items-center justify-center h-24 bg-white/2 border border-white/5 rounded-xl mb-4 group-hover:bg-white/5 transition-all px-4">
                  {getLogoComponent(pt.logoUrl, pt.name)}
                </div>

                {/* Info and Link */}
                <div className="relative z-10 flex items-center justify-between text-xs mt-2">
                  <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{pt.name}</span>
                  <a
                    href={pt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-thunder-cyan hover:underline hover:text-white transition-all"
                  >
                    <span>Visit Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}

            {/* Partner with Us CTA Card inside grid */}
            <div
              className="group relative flex flex-col justify-center p-6 rounded-2xl border border-dashed border-thunder-cyan/30 bg-thunder-cyan/5 backdrop-blur-md transition-all duration-300 hover:border-thunder-cyan hover:bg-thunder-cyan/10 overflow-hidden text-center min-h-[170px]"
            >
              <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                <div className="p-2.5 rounded-full bg-thunder-cyan/10 border border-thunder-cyan/20 text-thunder-cyan">
                  <Plus className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Partner with Us</h4>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">Collaborate and build the cybersecurity community.</p>
                </div>
                <Link
                  href="/partner"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-bold font-mono tracking-widest uppercase bg-thunder-cyan text-[#030303] border border-thunder-cyan/40 shadow-glow-cyan transition-all"
                >
                  Join as Partner
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
