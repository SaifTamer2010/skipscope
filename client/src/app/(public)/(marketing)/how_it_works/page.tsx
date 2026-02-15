"use client";

import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: <ClipboardList className="w-10 h-10" />,
    title: "1. Submit Your Request",
    description:
      "Fill out our simple request form with your target criteria. Be as specific as possible to help us find exactly what you need.",
    delay: 0.2,
  },
  {
    icon: <Clock className="w-10 h-10" />,
    title: "2. Processing",
    description:
      "Our system and team get to work immediately. This comprehensive search typically takes 24-48 hours to ensure accuracy.",
    delay: 0.4,
  },
  {
    icon: <CheckCircle className="w-10 h-10" />,
    title: "3. Receive Results",
    description:
      "Once completed, you'll receive a notification. Your verified data will be ready for review and download in your dashboard.",
    delay: 0.6,
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background-main flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl"
      >
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight">
            How It Works
          </h1>
          <p className="text-lg md:text-xl text-text-secondry max-w-2xl mx-auto leading-relaxed">
            Follow our simple 3-step process to transform your requirements into
            verified, actionable data.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-transparent via-background-third to-transparent -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.delay, duration: 0.5 }}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Card Content */}
              <div className="bg-background-secondry p-8 rounded-2xl border border-background-third shadow-lg hover:shadow-background-third/20 transition-all duration-300 w-full h-full flex flex-col items-center hover:-translate-y-1">
                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full bg-background-third flex items-center justify-center mb-6 text-text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner ring-1 ring-white/5">
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-4">
                  {step.title}
                </h3>

                <p className="text-text-secondry leading-relaxed text-sm md:text-base">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-20 text-center"
        >
          <Link
            href="/app/auth/register" // Adjust based on your actual route
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-background-main bg-text-primary rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started Now
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HowItWorksPage;
