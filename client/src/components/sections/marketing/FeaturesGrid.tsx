"use client";

import { motion } from "framer-motion";
import { Search, Zap, Target } from "lucide-react";

const features = [
  {
    title: "Deep Search Intelligence",
    description: "Uncover hidden data points and verified contact info that standard tools miss.",
    icon: <Search className="w-8 h-8 text-red-500" />,
  },
  {
    title: "Bulk Portfolio Processing",
    description: "Submit thousands of property records and receive enriched data in minutes.",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
  },
  {
    title: "Real Estate Focus",
    description: "Tailored algorithms specifically designed for the real estate market.",
    icon: <Target className="w-8 h-8 text-blue-500" />,
  },
];

const FeaturesGrid = () => {
  return (
    <section id="features" className="w-full max-w-7xl py-32 px-6 relative">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
          Engineered for <span className="italic text-red-600">Precision</span>
        </h2>
        <p className="text-text-secondry max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-80">
          Traditional data providers are outdated. Skipscope utilizes real-time connectivity
          to ensure you have the most accurate property data available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            viewport={{ once: true }}
            className="bg-background-third border border-white/5 p-8 rounded-2xl hover:border-red-600/30 transition-colors group"
          >
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
            <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
            <p className="text-text-secondry text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
