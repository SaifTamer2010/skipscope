"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Use framer-motion for animations

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: "text" | "number" | "password";
}

export default function InputModal({
  isOpen,
  onClose,
  title,
  label,
  defaultValue = "",
  onConfirm,
  placeholder = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  inputType = "text",
}: InputModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(defaultValue); // Reset input value when modal opens or defaultValue changes
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    onConfirm(inputValue);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-black">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <label htmlFor="input-field" className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <input
                id="input-field"
                ref={inputRef}
                type={inputType}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
              />
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-medium transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-all shadow-md"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Ensure X icon is available, assuming it's from 'lucide-react'
import { X } from "lucide-react";
