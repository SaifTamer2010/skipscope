"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Properties Analyzed", value: "1.2M+" },
  { label: "Contact Accuracy", value: "99.8%" },
  { label: "Active Professionals", value: "500+" },
];

const StatsBar = () => {
  return (
    <section id="stats" className="w-full bg-background-secondry border-b border-white/5 py-12 px-6">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 text-center ">
        Why <span className="bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-transparent italic">Skipscope?</span>
      </h2>
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-text-secondry text-sm font-medium uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
