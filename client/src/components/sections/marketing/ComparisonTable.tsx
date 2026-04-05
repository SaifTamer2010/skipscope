"use client";

import { motion } from "framer-motion";

const comparisonData = [
  { parameter: "Data Accuracy", us: "99.8%", them: "60-70%" },
  { parameter: "Processing Speed", us: "Minutes", them: "Days" },
  { parameter: "Real-time Verification", us: "✅ Included", them: "❌ No" },
  { parameter: "Hidden Lead Discovery", us: "✅ Advanced", them: "❌ Standard" },
  { parameter: "Data Privacy", us: "✅ Bank-grade", them: "⚠️ Variable" },
];

const ComparisonTable = () => {
  return (
    <section id="comparison" className="w-full max-w-7xl py-32 px-6">
      <div className="mb-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic italics">Skipscope vs. Legacy Data</h2>
        <div className="h-1 w-24 bg-red-600 mx-auto rounded-full"></div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 uppercase text-xs tracking-widest text-text-secondry">
              <th className="py-6 px-4">Feature</th>
              <th className="py-6 px-4 text-red-500">Skipscope Intelligence</th>
              <th className="py-6 px-4">Standard Providers</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-6 px-4 text-white font-medium">{row.parameter}</td>
                <td className="py-6 px-4 text-white font-bold">{row.us}</td>
                <td className="py-6 px-4 text-text-secondry">{row.them}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ComparisonTable;
