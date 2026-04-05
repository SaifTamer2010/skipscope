"use client";

import { motion } from "framer-motion";
import { UserPlus, FileText, DownloadCloud } from "lucide-react";

const howItWorksSteps = [
  {
    step: "01",
    title: "Sign Up",
    description: "Create an account and get access to our dashboard.",
    icon: <UserPlus className="w-12 h-12 text-red-500" />,
  },
  {
    step: "02",
    title: "Submit a request",
    description: "Submit a request with your property details and get verified contact information.",
    icon: <FileText className="w-12 h-12 text-red-500" />,
  },
  {
    step: "03",
    title: "Download Enriched Data",
    description: "Export your verified leads instantly.",
    icon: <DownloadCloud className="w-12 h-12 text-red-500" />,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full max-w-7xl py-32 px-6">
      <div className="text-center mb-20 text-white leading-tight">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">How It Works</h2>
        <div className="h-1 w-20 bg-red-600 mx-auto rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10 -z-10"></div>
        {howItWorksSteps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            viewport={{ once: true }}
            className="bg-black border border-white/5 p-8 rounded-3xl relative text-center"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-700 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-black">
              {step.step}
            </div>
            <div className="mb-6 mt-4 flex justify-center">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
            <p className="text-text-secondry text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
