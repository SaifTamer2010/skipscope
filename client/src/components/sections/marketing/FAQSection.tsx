"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How accurate is the contact data?",
    answer: "Our data is cross-referenced with real-time sources to ensure a 99.8% accuracy rate, significantly higher than standard providers.",
  },
  {
    question: "Do you find cell phone numbers or just landlines?",
    answer: "We prioritize mobile numbers and verified direct lines to maximize your chances of reaching the owner.",
  },
  {
    question: "How fast is bulk processing?",
    answer: "A list of 1,000 records typically processes in under 5 minutes, though this can vary with list complexity.",
  },
  {
    question: "Is my property data secure?",
    answer: "Yes, we use bank-grade encryption and we never sell your property lists to third parties.",
  },
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border-light">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-brand-red transition-colors"
      >
        <span className="text-lg font-bold text-text-primary">{question}</span>
        <span className="text-2xl">{isOpen ? "−" : "+"}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-text-secondry leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  return (
    <section id="faq" className="w-full max-w-3xl py-32 px-6">
      <div className="mb-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">Common Questions</h2>
        <p className="text-text-secondry">Everything you need to know about our precision data.</p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
