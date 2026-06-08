"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileCheck, Terminal, Award, HelpCircle } from "lucide-react";
import CyberCaptcha from "../ui/CyberCaptcha";
import confetti from "canvas-confetti";

type FormTab = "contact" | "sponsor" | "partner" | "volunteer";

interface ContactFormsProps {
  forceTab?: FormTab;
}

export default function ContactForms({ forceTab }: ContactFormsProps = {}) {
  const [activeTab, setActiveTab] = useState<FormTab>(forceTab || "contact");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Common fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Specialized states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sponsorTier, setSponsorTier] = useState("Silver");
  const [partnerOrg, setPartnerOrg] = useState("");
  const [partnerType, setPartnerType] = useState("Community");
  const [github, setGithub] = useState("");
  const [skills, setSkills] = useState("");

  const handleCaptchaVerify = (verified: boolean, token: string) => {
    setCaptchaVerified(verified);
    setCaptchaToken(token);
  };

  const resetForms = () => {
    setName("");
    setEmail("");
    setMessage("");
    setCompany("");
    setRole("");
    setPartnerOrg("");
    setGithub("");
    setSkills("");
    setCaptchaVerified(false);
    setCaptchaToken("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setStatus("error");
      setErrorMessage("Human verification required: bypass the firewall first.");
      return;
    }

    setLoading(true);
    setStatus("idle");

    // Construct body depending on active tab
    let body = {};
    if (activeTab === "contact") {
      body = { name, email, message, captchaToken };
    } else if (activeTab === "sponsor") {
      body = { name, email, company, role, sponsorTier, message, captchaToken };
    } else if (activeTab === "partner") {
      body = { name, email, partnerOrg, partnerType, message, captchaToken };
    } else if (activeTab === "volunteer") {
      body = { name, email, github, skills, message, captchaToken };
    }

    try {
      const response = await fetch(`/api/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resData = await response.json();

      if (response.ok) {
        setStatus("success");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#0052ff", "#00f0ff", "#ffffff"],
        });
        resetForms();
      } else {
        setStatus("error");
        setErrorMessage(resData.error || "Failed to process form payload.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Network error: Server response timed out.");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: FormTab; name: string }[] = [
    { id: "contact", name: "General Inquiry" },
    { id: "sponsor", name: "Sponsor Application" },
    { id: "partner", name: "Partner With Us" },
    { id: "volunteer", name: "Become a Volunteer" },
  ];

  return (
    <section className="relative z-10 py-24 px-6 md:px-8 border-t border-white/5" id="contact">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
            ENGAGEMENT HUB
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Connect & Collaborate
          </h2>
          <div className="w-12 h-1 bg-thunder-blue mx-auto rounded-full mt-4" />
        </div>

        {/* Form Selector Tabs */}
        {!forceTab && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1 bg-white/2 border border-white/5 rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatus("idle");
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-thunder-blue text-white shadow-glow-blue"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

        {/* Main Form Box */}
        <div className="rounded-2xl border border-white/5 bg-[#070913]/30 p-6 sm:p-8 backdrop-blur-sm shadow-sm relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Form Title banner */}
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 pb-4 border-b border-white/5">
                <span>Please fill in the details below to submit your request</span>
              </div>

              {/* Status Alerts */}
              {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                  <FileCheck className="w-4.5 h-4.5" />
                  <span>Success: Your request has been sent successfully.</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <HelpCircle className="w-4.5 h-4.5" />
                  <span>Error: {errorMessage}</span>
                </div>
              )}

              {/* Inputs Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Dynamic inputs based on active form tab */}
              {activeTab === "sponsor" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Organization Inc."
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      Your Role
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="CTO / SecOps Lead"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      Sponsor Tier
                    </label>
                    <select
                      value={sponsorTier}
                      onChange={(e) => setSponsorTier(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                    >
                      <option value="Platinum">Platinum Shield</option>
                      <option value="Gold">Gold Defense</option>
                      <option value="Silver">Silver Telemetry</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "partner" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      Community or Club Name
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerOrg}
                      onChange={(e) => setPartnerOrg(e.target.value)}
                      placeholder="e.g. DEFCON Delhi"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      Partnership Type
                    </label>
                    <select
                      value={partnerType}
                      onChange={(e) => setPartnerType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                    >
                      <option value="Community">Community Partner</option>
                      <option value="Academic">Academic / University Partner</option>
                      <option value="Media">Media / Press Partner</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "volunteer" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      required
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-400">
                      Primary Skills
                    </label>
                    <input
                      type="text"
                      required
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Red Teaming, React, Event Management"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Description/Message text block */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-slate-400">
                  {activeTab === "contact"
                    ? "Inquiry Details"
                    : activeTab === "sponsor"
                    ? "Sponsorship Details"
                    : activeTab === "partner"
                    ? "Partnership Objective"
                    : "Tell Us About Yourself"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain details here..."
                  className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Reusable Slider CAPTCHA */}
              <CyberCaptcha onVerify={handleCaptchaVerify} />

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-xs font-bold tracking-widest font-mono uppercase bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg border border-thunder-blue/40 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Submit Form</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
