"use client";

import { motion } from "framer-motion";
import MainButton from "@/src/components/buttons/MainButton";

const CTASection = () => {
  return (
    <section className="w-full max-w-5xl py-32 px-6 text-center ">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-brand-red-dark/20 to-black border border-border-light rounded-3xl p-12 md:p-24 overflow-hidden relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red-strong/10 blur-[120px] -z-10 rounded-full"></div>

        <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-8 leading-tight">
          Ready to Scope more <br /><span className="italic text-brand-red-strong">DEALS?</span>
        </h2>
        <p className="text-text-secondry text-lg mb-12 max-w-xl mx-auto italic font-medium">
          Join the elite network of real estate professionals using intelligence to win.
        </p>
        <div className="scale-125 mb-16">
          <MainButton Goto="/app/auth/register">
            <span className="font-bold">Get Started</span>
          </MainButton>
        </div>

        <div className="pt-12 border-t border-border-light">
          <p className="text-text-secondry text-sm font-semibold uppercase tracking-widest mb-4">Enterprise & High Volume</p>
          <h4 className="text-text-primary text-xl font-bold mb-6 italic">Processing over 100k leads per month?</h4>
          <a href="mailto:support@skipscope.com" className="text-brand-red hover:text-brand-red-strong transition-colors font-bold text-lg">Contact Enterprise Sales →</a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
