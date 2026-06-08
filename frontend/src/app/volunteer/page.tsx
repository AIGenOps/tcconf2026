"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ContactForms from "@/components/sections/ContactForms";

export default function VolunteerPage() {
  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 bg-[#030303] relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8">
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

        {/* Form Container */}
        <ContactForms forceTab="volunteer" />
      </div>
    </main>
  );
}
