"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, FileText, ChevronRight } from "lucide-react";

interface LegalModalProps {
  onClose: () => void;
  initialTab?: "privacy" | "terms";
}

const LegalModal = ({ onClose, initialTab = "privacy" }: LegalModalProps) => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">(initialTab);

  if (typeof document === "undefined") return null;

  const tabs = [
    { id: "privacy" as const, label: "Privacy Policy", icon: <ShieldCheck size={16} /> },
    { id: "terms" as const, label: "Terms of Service", icon: <FileText size={16} /> },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background-main/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-background-secondry/90 backdrop-blur-2xl border border-border-light rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-border-muted bg-background-third/20">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight italic">Legal Center</h2>
              <p className="text-[10px] font-bold text-text-secondry uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                SkipScope Transparency & Compliance
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondry hover:text-text-primary hover:bg-background-third rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1.5 bg-background-main/50 border border-border-muted rounded-2xl w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-primary text-text-button shadow-lg shadow-brand-primary/20"
                    : "text-text-secondry hover:text-text-primary"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="prose prose-invert prose-sm max-w-none space-y-8"
            >
              {activeTab === "privacy" ? (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">01.</span> Introduction
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      SkipScope ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">02.</span> Information We Collect
                    </h3>
                    <ul className="space-y-2 text-text-secondry list-none p-0">
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> <strong>Required:</strong> Email address, phone number</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> <strong>Optional:</strong> Age, company name, role/title</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> <strong>Automatically:</strong> IP address, browser type, usage data, cookies</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">03.</span> How We Use Your Information
                    </h3>
                    <ul className="space-y-2 text-text-secondry list-none p-0">
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> To create and manage your account</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> To process skip trace orders</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> To communicate order updates and support responses</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> To improve our platform and services</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> To comply with legal obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">04.</span> Data Retention
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      We retain your data for as long as your account is active. You may request deletion at any time via the support button on our platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">05.</span> Your Rights
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      You have the right to access your personal data, request correction or deletion, withdraw consent at any time, and export your data.
                    </p>
                  </section>

                  <section className="pt-6 border-t border-border-muted italic opacity-40">
                    <p className="text-[10px] text-text-secondry font-bold uppercase tracking-widest">
                      Last Updated: April 17, 2026
                    </p>
                  </section>
                </div>
              ) : (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">01.</span> Acceptance of Terms
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      By creating an account and using SkipScope, you agree to these Terms of Service. If you do not agree, do not use the platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">02.</span> Description of Service
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      SkipScope is a B2B skip tracing SaaS platform that provides people-search data for legitimate real estate professionals in the United States.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">03.</span> Acceptable Use
                    </h3>
                    <ul className="space-y-2 text-text-secondry list-none p-0">
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> Use the platform only for lawful purposes</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> No harassment, stalking, or illegal use</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> No reselling or redistributing obtained data</li>
                      <li className="flex gap-3"><ChevronRight size={14} className="text-brand-primary mt-1 flex-shrink-0" /> No scrapers or reverse engineering</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">04.</span> Payments
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      Orders are charged per submission based on the number of leads requested. All payments are final unless otherwise stated. We reserve the right to change pricing with notice.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">05.</span> Data Accuracy
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      Skip trace data is sourced from third-party people-search databases. SkipScope does not guarantee the accuracy, completeness, or timeliness of results.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                      <span className="text-brand-primary">06.</span> Limitation of Liability
                    </h3>
                    <p className="text-text-secondry leading-relaxed">
                      SkipScope is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                    </p>
                  </section>

                  <section className="pt-6 border-t border-border-muted italic opacity-40">
                    <p className="text-[10px] text-text-secondry font-bold uppercase tracking-widest">
                      Last Updated: April 17, 2026
                    </p>
                  </section>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 bg-background-third/20 border-t border-border-muted flex items-center justify-between">
            <p className="text-[9px] text-text-secondry/40 font-bold uppercase tracking-[0.2em]">SkipScope Legal Operations v1.0.4</p>
            <button 
                onClick={onClose}
                className="text-[10px] text-brand-primary font-black uppercase tracking-widest hover:text-brand-primary-strong transition-colors"
            >
                Acknowledge & Close
            </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default LegalModal;
