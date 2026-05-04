"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sun, Hammer, Wrench, Shield, DollarSign } from "lucide-react";

const useCases = [
  {
    role: "Real Estate Professionals",
    benefit: "Wholesalers, investors, and agents who need motivated seller and buyer data to fuel their deals.",
    icon: <Home className="w-6 h-6 text-brand-primary" />,
    results: [
      { label: "Distressed Sellers Found", value: "1,420" },
      { label: "Phone Match Rate", value: "94%" },
    ],
    metric: "Elite Data"
  },
  {
    role: "Solar Companies",
    benefit: "Clean, targeted homeowner data that boosts appointment rates and drives solar adoption.",
    icon: <Sun className="w-6 h-6 text-cyan-600" />,
    results: [
      { label: "Tier-1 Homeowners", value: "812" },
      { label: "Roof-Type Verified", value: "Verified" },
    ],
    metric: "Smart Targeting"
  },
  {
    role: "Roofing Companies",
    benefit: "Reach the right homeowners in need of roofing services with high-quality lists.",
    icon: <Hammer className="w-6 h-6 text-blue-600" />,
    results: [
      { label: "Storm-Impacted Areas", value: "64 Zones" },
      { label: "Verified Homeowners", value: "1,200+" },
    ],
    metric: "Local Edge"
  },
  {
    role: "Home Improvement Businesses",
    benefit: "From contractors to remodelers, we provide leads that turn into booked projects.",
    icon: <Wrench className="w-6 h-6 text-teal-600" />,
    results: [
      { label: "Project-Ready Leads", value: "450" },
      { label: "Income Verified", value: "Top 20%" },
    ],
    metric: "Quality Conversion"
  },
  // {
  //   role: "Health Insurance Providers",
  //   benefit: "Connect with prospects in your target markets with accuracy and compliance in mind.",
  //   icon: <Shield className="w-6 h-6 text-indigo-600" />,
  //   results: [
  //     { label: "Aged Leads Enriched", value: "2,100" },
  //     { label: "TCPA Compliant", value: "100%" },
  //   ],
  //   metric: "Compliant Leads"
  // },
  // {
  //   role: "Debt Collection Agencies",
  //   benefit: "Data that ensures higher contact rates and greater recovery success.",
  //   icon: <DollarSign className="w-6 h-6 text-purple-600" />,
  //   results: [
  //     { label: "Valid Contact Info Found", value: "98%" },
  //     { label: "Recovery Rate Boost", value: "+30%" },
  //   ],
  //   metric: "Max Recovery"
  // },
];

const IndustriesSection = () => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <section id="industries" className="w-full max-w-7xl py-32 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-8 tracking-tight">
            Tailored for Every <br />
            <span className="bg-gradient-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent italic">Market Role</span>
          </h2>
          <p className="text-text-secondry mb-12 text-lg">Whether you are sourcing your first deal or managing a major portfolio, Skipscope provides the insights you need.</p>
          <div className="space-y-4">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                onMouseEnter={() => setHoveredRole(useCase.role)}
                onMouseLeave={() => setHoveredRole(null)}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-4 p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${hoveredRole === useCase.role
                  ? "border-brand-primary-strong/40 bg-brand-primary-strong/5 shadow-primary"
                  : "border-border-muted bg-background-secondry/50"
                  }`}
              >
                <div className={`p-3 rounded-xl border transition-colors duration-500 ${hoveredRole === useCase.role ? "bg-brand-primary-strong/20 border-brand-primary-strong/40" : "bg-background-third border-border-light"
                  }`}>
                  {useCase.icon}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-lg mb-1">{useCase.role}</h4>
                  <p className="text-text-secondry text-sm font-medium leading-relaxed">{useCase.benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 bg-brand-primary-strong/5 blur-[120px] -z-10 rounded-full"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredRole || 'default'}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full w-full bg-background-main/80 backdrop-blur-3xl border border-border-light rounded-[3rem] p-12 flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-2xl"
            >
              {/* Visual Scanning Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary-strong/50 blur-[2px] animate-[scan_4s_infinite]"></div>

              {hoveredRole ? (
                <div className="w-full space-y-12 relative z-10">
                  <div className="space-y-4">
                    <div className="w-24 h-24 rounded-3xl bg-brand-primary-strong/10 border border-brand-primary-strong/20 flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-brand-primary-strong/10 group-hover:scale-110 transition-transform duration-500">
                      {useCases.find(u => u.role === hoveredRole)?.icon}
                    </div>
                    <div className="inline-block px-4 py-1.2 rounded-full bg-brand-primary-strong/10 border border-brand-primary-strong/20 text-xs font-black text-brand-primary uppercase tracking-[0.2em]">
                      {useCases.find(u => u.role === hoveredRole)?.metric}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {useCases.find(u => u.role === hoveredRole)?.results?.map((res, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="p-6 bg-background-secondry rounded-2xl border border-border-light text-left"
                      >
                        <div className="text-3xl font-black text-text-primary mb-2 tracking-tight">{res.value}</div>
                        <div className="text-[10px] text-text-secondry font-bold uppercase tracking-widest">{res.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-border-light">
                    <p className="text-text-secondry text-lg italic font-medium">"Skipscope delivered more results in 10 minutes than our previous provider did in a month."</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 opacity-40">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-border-light flex items-center justify-center mx-auto text-text-primary/20 text-6xl">
                    ?
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">Select a Market Role</h3>
                    <p className="text-text-secondry max-w-xs mx-auto">Hover over the roles on the left to see live metrics and found data examples.</p>
                  </div>
                </div>
              )}

              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-primary-strong/10 blur-[100px] rounded-full"></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-24 text-center opacity-40">
        <p className="text-lg text-text-secondry italic font-medium italic underline decoration-brand-primary-strong/50 underline-offset-8">Precision Insights tailored for high-stakes markets.</p>
      </div>
    </section>
  );
};

export default IndustriesSection;
