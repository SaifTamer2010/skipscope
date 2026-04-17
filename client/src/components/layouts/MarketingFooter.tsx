"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import SupportModal from "@/src/components/ui/modals/SupportModal";
import LegalModal from "@/src/components/ui/modals/LegalModal";

const MarketingFooter = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "terms">("privacy");

  const openLegalModal = (tab: "privacy" | "terms") => {
    setActiveLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  return (
    <footer className="w-full py-12 px-6 border-t border-border-muted mt-auto">
      <AnimatePresence>
        {isSupportModalOpen && <SupportModal onClose={() => setIsSupportModalOpen(false)} />}
        {isLegalModalOpen && (
          <LegalModal 
            onClose={() => setIsLegalModalOpen(false)} 
            initialTab={activeLegalTab} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-50 hover:opacity-100 transition-opacity">
        <div className="text-xl font-black text-text-primary tracking-tighter uppercase italic">
          SKIPSCOPE<span className="text-brand-primary">.</span>
        </div>
        <div className="flex gap-8 text-sm text-text-secondry font-medium items-center">
          <span 
            onClick={() => openLegalModal("privacy")}
            className="cursor-pointer hover:text-text-primary transition-colors uppercase italic"
          >
            Privacy
          </span>
          <span 
            onClick={() => openLegalModal("terms")}
            className="cursor-pointer hover:text-text-primary transition-colors uppercase italic"
          >
            Terms
          </span>
          <span 
            onClick={() => setIsSupportModalOpen(true)}
            className="cursor-pointer hover:text-text-primary transition-colors uppercase italic"
          >
            Support
          </span>
          <div className="pl-4 border-l border-border-muted ml-4">
            <ThemeToggle />
          </div>
        </div>
        <div className="text-xs text-text-secondry font-medium italic">© 2026 Skipscope Data Labs</div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
