"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, User, MessageSquare, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface SupportModalProps {
  onClose: () => void;
}

const SupportModal = ({ onClose }: SupportModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/support", formData);
      toast.success("Support request sent! We'll get back to you soon.");
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to send request. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background-main/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-background-secondry/80 backdrop-blur-2xl border border-border-light rounded-[2.5rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[80px] -z-10 rounded-full"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border-muted bg-background-third/20">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Support Desk</h2>
            <p className="text-[10px] font-bold text-text-secondry uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              Direct bridge to our operations team
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondry hover:text-text-primary hover:bg-background-third rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest pl-1">Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry group-focus-within:text-brand-primary transition-colors">
                  <User size={16} />
                </div>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-background-third/50 border border-border-muted rounded-2xl py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondry/40 focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest pl-1">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry group-focus-within:text-brand-primary transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full bg-background-third/50 border border-border-muted rounded-2xl py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondry/40 focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest pl-1">Subject</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry group-focus-within:text-brand-primary transition-colors">
                <Info size={16} />
              </div>
              <input
                required
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full bg-background-third/50 border border-border-muted rounded-2xl py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondry/40 focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest pl-1">Message</label>
            <div className="relative group">
              <div className="absolute left-4 top-6 text-text-secondry group-focus-within:text-brand-primary transition-colors">
                <MessageSquare size={16} />
              </div>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Details of your request..."
                className="w-full bg-background-third/50 border border-border-muted rounded-2xl py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondry/40 focus:outline-none focus:border-brand-primary/50 transition-all font-medium resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary hover:bg-brand-primary-strong text-text-button text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Send
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="px-8 pb-8 text-center">
          <p className="text-[9px] text-text-secondry/40 font-bold uppercase tracking-widest italic">
            Average Response Time: &lt; 2 Hours
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default SupportModal;
