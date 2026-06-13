"use client";

import React from "react";
import { MapPin, Train, Plane, Navigation, Globe } from "lucide-react";

export default function Venue() {
  return (
    <section className="relative z-10 py-24 px-6 md:px-8 border-t border-white/5" id="venue">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-thunder-blue/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
            EVENT LOCATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Venue — Sharda University
          </h2>
          <div className="w-12 h-1 bg-thunder-blue mx-auto rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Details / Logistics Column (6 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Sharda University Campus</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                Located at Plot No. 32-34, Knowledge Park III, Greater Noida, Sharda University is a premium state-of-the-art educational hub equipped with modern auditoriums, fiber-optic networking, and large hacking villages halls designed for hands-on activities.
              </p>
            </div>

            {/* Address Card */}
            <div className="flex items-start space-x-4 p-5 rounded-xl bg-white/2 border border-white/5 backdrop-blur-sm">
              <div className="p-3 rounded-lg bg-thunder-blue/10 border border-thunder-blue/30 text-thunder-cyan">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">ADDRESS</span>
                <p className="text-slate-200 text-sm font-semibold leading-relaxed">
                  Plot No. 32-34, Knowledge Park III,<br />
                  Greater Noida, Uttar Pradesh, 201310, India
                </p>
                <div className="text-xs font-mono text-thunder-cyan mt-1 font-bold">
                  LAT: 28.4731° N | LON: 77.4829° E
                </div>
              </div>
            </div>

            {/* Travel Directions */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                TRAVEL LOGISTICS
              </h4>
              
              <div className="space-y-3">
                {/* Metro */}
                <div className="flex items-start space-x-3 text-xs">
                  <Train className="w-4 h-4 text-thunder-cyan mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">Nearest Metro Station</span>
                    <p className="text-slate-200">Knowledge Park II Metro Station (Aqua Line) — 1.5 km away.</p>
                  </div>
                </div>

                {/* Airport */}
                <div className="flex items-start space-x-3 text-xs">
                  <Plane className="w-4 h-4 text-thunder-cyan mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">From Airports</span>
                    <p className="text-slate-200">Indira Gandhi International Airport (DEL) — approx 50 km (60 mins drive via DND Flyway).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Link Button */}
            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Sharda+University+Greater+Noida"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 hover:border-thunder-blue hover:bg-thunder-blue/10 text-slate-200 hover:text-white transition-all duration-300"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full rounded-2xl border border-white/5 bg-[#070913]/30 backdrop-blur-md p-6 overflow-hidden flex flex-col justify-between group hover:border-thunder-blue/20 transition-all duration-500">
              
              {/* Map Header */}
              <div className="flex items-center justify-between text-sm text-slate-200 font-bold">
                <span>Campus Map Overview</span>
              </div>

              {/* Styled Interactive Google Map */}
              <div className="relative w-full h-full my-4 flex items-center justify-center bg-[#030305]/50 border border-white/5 rounded-xl overflow-hidden min-h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.250824304843!2d77.47899747495086!3d28.47199199135383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cea058a5b656f%3A0xad2b152b3c826585!2sKnowledge%20Park%20III%2C%20Greater%20Noida%2C%20Uttar%20Pradesh%20201310!5e0!3m2!1sen!2sin!4v1780935750644!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full grayscale invert opacity-75 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                />
              </div>

              <div className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
