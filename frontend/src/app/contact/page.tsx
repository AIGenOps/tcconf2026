"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import ContactForms from "@/components/sections/ContactForms";

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-8 bg-[#030303] relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Return link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm font-mono text-slate-200 hover:text-thunder-cyan transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
            <span>RETURN TO HOME</span>
          </Link>
        </div>

        {/* Form Container */}
        <ContactForms forceTab="contact" />
      </div>
    </main>
  );
}
