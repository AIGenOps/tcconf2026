import React from "react";
import Link from "next/link";
import { getSpeakers, Speaker } from "@/lib/sanity";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, Award01Icon, Shield01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const revalidate = 0; // Disable cache for instant update

export default async function SpeakersPage() {
  const allSpeakers = await getSpeakers();

  const keynotes = allSpeakers.filter((s) => s.category === "keynote");
  const panelists = allSpeakers.filter((s) => s.category === "panelist");
  const showcase = allSpeakers.filter((s) => s.category === "showcase");

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 relative bg-[#030303]">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Back Link & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm font-mono text-slate-200 hover:text-thunder-cyan transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4.5 h-4.5" />
            <span>RETURN_TO_HOME</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Speakers & Keynotes
            </h1>
            <p className="text-slate-200 text-sm max-w-xl">
              Meet the elite minds shaping the cyber defense space. Researchers, analysts, CISOs, and developers sharing active zero-day findings.
            </p>
          </div>
          <div className="w-12 h-1 bg-thunder-blue rounded-full" />
        </div>

        {/* Section 1: Keynote Speakers */}
        {keynotes.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-200 uppercase tracking-widest pb-2 border-b border-white/5 font-bold">
              <HugeiconsIcon icon={Award01Icon} className="w-4.5 h-4.5 text-yellow-400" />
              <span>CATEGORY_STREAM: KEYNOTE_SPEAKERS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {keynotes.map((speaker, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0c]/60 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-thunder-blue/30 flex flex-col justify-between"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-thunder-blue/0 to-thunder-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="space-y-6">
                    {/* Head Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                          {speaker.avatar ? (
                            <img
                              src={speaker.avatar}
                              alt={speaker.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs font-bold bg-[#070913]">
                              TC
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-thunder-cyan uppercase tracking-wider font-bold">
                            KEYNOTE PRESENTER
                          </span>
                          <h3 className="text-2xl font-bold text-white tracking-wide">{speaker.name}</h3>
                        </div>
                      </div>
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full border border-white/5 bg-white/2 text-slate-300 hover:text-white transition-all flex-shrink-0"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="text-sm font-mono text-slate-300">
                      {speaker.designation} <span className="text-thunder-blue font-bold">@</span> {speaker.company}
                    </div>

                    <p className="text-slate-200 text-sm leading-relaxed font-sans">{speaker.bio}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
                    SESSION_ID: tc-keynote-{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: CXO Panels */}
        {panelists.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-200 uppercase tracking-widest pb-2 border-b border-white/5 font-bold">
              <HugeiconsIcon icon={Shield01Icon} className="w-4.5 h-4.5 text-thunder-cyan animate-pulse" />
              <span>CATEGORY_STREAM: CXO_PANELISTS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {panelists.map((speaker, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#070913]/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-thunder-cyan/30"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3.5">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                          {speaker.avatar ? (
                            <img
                              src={speaker.avatar}
                              alt={speaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200 font-mono text-xs bg-[#070913]">
                              TC
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                            {speaker.name}
                          </h4>
                          <span className="text-xs font-mono text-slate-300 uppercase font-semibold">{speaker.company}</span>
                        </div>
                      </div>
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white transition-colors pt-1 flex-shrink-0"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">{speaker.bio}</p>
                    
                    <div className="text-xs font-mono text-thunder-cyan bg-white/2 py-1 px-2.5 rounded border border-white/5 max-w-max font-bold">
                      {speaker.designation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Speaker Showcase */}
        {showcase.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-200 uppercase tracking-widest pb-2 border-b border-white/5 font-bold">
              <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-thunder-blue" />
              <span>CATEGORY_STREAM: TECHNICAL_SHOWCASE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcase.map((speaker, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#070913]/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-thunder-blue/30"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3.5">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                          {speaker.avatar ? (
                            <img
                              src={speaker.avatar}
                              alt={speaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200 font-mono text-xs bg-[#070913]">
                              TC
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                            {speaker.name}
                          </h4>
                          <span className="text-xs font-mono text-slate-300 uppercase font-semibold">{speaker.company}</span>
                        </div>
                      </div>
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white transition-colors pt-1 flex-shrink-0"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed font-sans">{speaker.bio}</p>

                    <div className="text-xs font-mono text-thunder-cyan bg-white/2 py-1 px-2.5 rounded border border-white/5 max-w-max font-bold">
                      {speaker.designation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
