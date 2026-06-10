"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { getFAQs } from "@/lib/sanity";

interface FAQItem {
  question: string;
  answer: string;
}

const mockFAQs: FAQItem[] = [
  {
    question: "Who can attend the ThunderCipher Conference 2026?",
    answer: "The conference is open to everyone interested in cybersecurity. This includes security professionals, developers, researchers, students, and corporate partners looking for security products or talent.",
  },
  {
    question: "Are there any student discounts available?",
    answer: "Yes! We offer a dedicated Student Pass at a heavily discounted rate. You will need to bring a valid student ID card for verification at the registration counter on the event day.",
  },
  {
    question: "What should I bring for the Hacking Villages and Workshops?",
    answer: "You should bring a laptop with a modern web browser and a virtualization environment (like VirtualBox or VMware) installed. We recommend a Kali Linux or Parrot OS environment. For the Hardware Village, all development boards will be provided on-site.",
  },
  {
    question: "How do I participate in the Capture The Flag (CTF) event?",
    answer: "The CTF registration will open a week before the main conference. You can form teams of up to 4 members. CTF details, rule guides, and connection links will be listed on our dedicated CTF subpage.",
  },
  {
    question: "Can I get a certificate of participation?",
    answer: "Yes, all attendees will receive a digitally signed certificate of participation via email. You must verify your attendance at the feedback desk at the end of Day 2 to receive it.",
  },
  {
    question: "What is the cancellation and refund policy?",
    answer: "Tickets are refundable up to 14 days before the conference start date (September 19, 2026). After that date, tickets are non-refundable but can be transferred to another individual by contacting our support team.",
  },
];

function FAQAccordion({ question, answer, isOpen, onToggle }: FAQItem & { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/5 last:border-0 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-2 text-sm sm:text-base font-semibold text-slate-200 hover:text-white transition-colors group focus:outline-none"
      >
        <span className="flex items-center space-x-3">
          <HelpCircle className="w-4.5 h-4.5 text-thunder-cyan group-hover:scale-110 transition-transform duration-300" />
          <span>{question}</span>
        </span>
        <span className="p-1.5 rounded-full border border-white/5 bg-white/2 text-slate-400 group-hover:text-white transition-all duration-300">
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 pl-7 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans max-w-3xl">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FAQProps {
  initialFAQs?: FAQItem[];
}

export default function FAQ({ initialFAQs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqList, setFaqList] = useState<FAQItem[]>(initialFAQs || []);

  useEffect(() => {
    if (initialFAQs && initialFAQs.length > 0) {
      setFaqList(initialFAQs);
    } else {
      async function loadFAQs() {
        const data = await getFAQs();
        setFaqList(data);
      }
      loadFAQs();
    }
  }, [initialFAQs]);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 py-24 px-6 md:px-8 border-t border-white/5" id="faq">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-16 scroll-reveal">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-thunder-cyan uppercase">
            COMMON INQUIRIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="w-12 h-1 bg-thunder-blue mx-auto rounded-full mt-4" />
        </div>

        {/* Accordions */}
        <div className="rounded-2xl border border-white/5 bg-[#070913]/30 p-6 sm:p-8 backdrop-blur-sm shadow-sm scroll-reveal">
          {faqList.map((faq, index) => (
            <FAQAccordion
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
