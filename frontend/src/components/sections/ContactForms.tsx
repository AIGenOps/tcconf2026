"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileCheck, Terminal, HelpCircle, User, Mail, Link as LinkIcon, Briefcase } from "lucide-react";
import CyberCaptcha from "../ui/CyberCaptcha";
import confetti from "canvas-confetti";

type FormTab = "contact" | "volunteer";

interface ContactFormsProps {
  forceTab?: FormTab;
}

export default function ContactForms({ forceTab }: ContactFormsProps = {}) {
  const activeTab = forceTab || "contact";
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Common fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Volunteer specialized states
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

  return (
    <section className="relative z-10 py-16 px-6 md:px-8 border-t border-white/5" id="contact">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
            {activeTab === "contact" ? "ENGAGEMENT HUB" : "VOLUNTEER PORTAL"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            {activeTab === "contact" ? "Connect & Collaborate" : "Join the Core Team"}
          </h2>
          <div className="w-12 h-1 bg-thunder-blue mx-auto rounded-full mt-4" />
        </div>

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
              className="space-y-6 font-sans"
            >
              {/* Form Title banner */}
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-450 pb-4 border-b border-white/5">
                <span>Please provide your details below to submit your transmission.</span>
              </div>

              {/* Status Alerts */}
              {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 font-mono">
                  <FileCheck className="w-4.5 h-4.5" />
                  <span>Success: Form successfully submitted.</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2 font-mono">
                  <HelpCircle className="w-4.5 h-4.5" />
                  <span>Error: {errorMessage}</span>
                </div>
              )}

              {/* Inputs Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1.5 text-thunder-blue" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-thunder-blue" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@domain.com"
                    className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-sans"
                  />
                </div>
              </div>

              {/* Dynamic inputs based on active form tab */}
              {activeTab === "volunteer" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center">
                      <LinkIcon className="w-3.5 h-3.5 mr-1.5 text-thunder-blue" /> GitHub Profile
                    </label>
                    <input
                      type="url"
                      required
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-thunder-blue" /> Primary Skills
                    </label>
                    <input
                      type="text"
                      required
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Cyber Security, Writing"
                      className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Description/Message text block */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {activeTab === "contact" ? "Inquiry Details" : "Tell Us About Yourself"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    activeTab === "contact"
                      ? "Describe your inquiry here..."
                      : "Describe your experience and why you want to volunteer..."
                  }
                  className="w-full bg-white/2 border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 resize-none font-sans"
                />
              </div>

              {/* Reusable Slider CAPTCHA */}
              <CyberCaptcha onVerify={handleCaptchaVerify} />

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-xs font-bold tracking-widest font-mono uppercase bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg border border-thunder-blue/40 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>TRANSMITTING...</span>
                ) : (
                  <>
                    <span>Submit Request</span>
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
