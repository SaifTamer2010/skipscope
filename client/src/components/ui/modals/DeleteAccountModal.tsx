import React, { useState } from "react";
import { createPortal } from "react-dom";

import { X, AlertTriangle, ShieldCheck } from "lucide-react";

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteAccountModal = ({
  onClose,
  onConfirm,
  loading,
}: DeleteAccountModalProps) => {
  const [confirmationText, setConfirmationText] = useState("");
  const isValid = confirmationText === "DELETE";

  if (typeof document === "undefined") return null;

  return createPortal(

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-main/40 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="w-full max-w-md bg-background-secondry/80 backdrop-blur-2xl border border-red-500/20 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-red-500/10 bg-red-500/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-red-500 tracking-tight text-shadow-red uppercase">CRITICAL AUTHORIZATION</h2>
              <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">Permanent Data Erasure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondry hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-sm text-text-secondry font-medium leading-relaxed">
            You are about to execute a permanent deletion of your operational identity. This will result in the <span className="text-red-500 font-bold">irrevocable loss</span> of all active requests, operational history, and access credentials.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest ml-1">
                Confirm Erasure (Type "DELETE")
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-5 py-4 bg-background-main/30 border border-border-muted rounded-2xl focus:outline-none focus:border-red-500/50 text-red-500 font-mono font-bold tracking-widest transition-all"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-red-500/5 flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4 bg-background-third hover:bg-background-main text-text-primary text-xs font-black uppercase tracking-widest rounded-2xl border border-border-light transition-all shadow-xl"
          >
            Abort
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || loading}
            className={`
              flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl
              ${isValid && !loading
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 translate-y-0 active:translate-y-1"
                : "bg-red-500/10 text-red-500/40 border border-red-500/20 cursor-not-allowed opacity-50"}
            `}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={16} />
                Execute
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


export default DeleteAccountModal;
