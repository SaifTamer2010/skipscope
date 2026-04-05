"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import MainButton from "@/src/components/buttons/MainButton";

const HeroSection = () => {
  return (
    <section id="home" className="relative w-full max-w-7xl pt-20 pb-32 px-6 flex flex-col md:flex-row items-center gap-12">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 text-center md:text-left"
      >
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Precision Intelligence for </span>
          <span className="bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-transparent italic">
            Real Estate Experts
          </span>
        </h1>
        <p className="text-text-secondry text-lg md:text-xl max-w-xl mb-12">
          More than just a skip-tracing service — we're your partner in finding
          the right audience, uncovering hidden deals, and scaling your real estate portfolio.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
          <MainButton Goto="/app/auth/register">
            <span className="font-bold">Scale Now</span>
          </MainButton>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">
                User
              </div>
            ))}
            <div className="pl-6 text-sm text-gray-500 flex items-center italic">
              Join 500+ professionals
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="flex-1 relative aspect-[16/9] w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-red-600/20"
      >
        <Image
          src="/data/hero.png"
          alt="SkipScope lead intelligence dashboard showing real estate property data and contact analytics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
