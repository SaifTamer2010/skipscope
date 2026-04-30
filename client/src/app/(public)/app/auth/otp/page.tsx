"use client";

import AuthContainer from "@/components/ui/auth/authContainer";
import Logo from "@/components/ui/logo/logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

const OTPPage = () => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Email is required");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      toast.success("OTP sent to your email!");
      setStep("otp");
      setResendTimer(60); // 1 minute cooldown for UI
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError("Please enter a valid 6-digit code");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      // Store JWT
      localStorage.setItem("ss-token", data.token);
      
      // Update store
      setUser(data.user);

      toast.success("Verification successful!");
      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-transparent">
      <AuthContainer>
        <header className="flex justify-center items-center flex-col gap-4 mb-8">
          <Logo />
          <h1 className="text-3xl font-black text-text-primary uppercase italic tracking-tighter">
            {step === "email" ? "Verify Email" : "Enter Code"}
          </h1>
          <p className="text-text-secondry text-sm text-center px-4">
            {step === "email" 
              ? "We'll send a 6-digit code to your email address." 
              : `We've sent a code to ${email}`}
          </p>
          {step === "otp" && resendTimer > 0 && (
            <div className="mt-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest animate-pulse">
              Code expires in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, "0")}
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP}
              className="flex flex-col gap-6 w-full"
            >
              <label htmlFor="email" className="relative">
                <input
                  type="email"
                  placeholder="Email Address"
                  id="email"
                  value={email}
                  disabled={loading}
                  className={`bg-background-third border ${error ? "border-red-500/50" : "border-border-light"} w-full h-14 rounded-2xl p-6 pl-14 focus:border-brand-primary/50 focus:bg-background-main outline-none text-text-primary transition-all`}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute top-4 left-5 opacity-60 text-text-secondry" size={20} />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-brand-primary shadow-lg shadow-brand-glow-strong p-2 cursor-pointer hover:bg-brand-primary-strong hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-button font-bold uppercase italic tracking-tight flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Verification Code"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP}
              className="flex flex-col gap-6 w-full"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="otp" className="relative">
                  <input
                    type="text"
                    placeholder="000000"
                    id="otp"
                    maxLength={6}
                    value={otp}
                    disabled={loading}
                    className={`bg-background-third border ${error ? "border-red-500/50" : "border-border-light"} w-full h-14 rounded-2xl p-6 pl-14 focus:border-brand-primary/50 focus:bg-background-main outline-none text-text-primary text-center text-2xl tracking-[0.5em] font-bold transition-all`}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <Key className="absolute top-4 left-5 opacity-60 text-text-secondry" size={20} />
                </label>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-brand-primary shadow-lg shadow-brand-glow-strong p-2 cursor-pointer hover:bg-brand-primary-strong hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-button font-bold uppercase italic tracking-tight flex items-center justify-center gap-2"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
                {!loading && <CheckCircle2 size={20} />}
              </button>

              <div className="flex justify-between items-center px-2">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-xs text-text-secondry hover:text-text-primary transition-colors uppercase italic font-medium"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-xs text-brand-primary hover:text-brand-primary-strong transition-colors uppercase italic font-bold flex items-center gap-2 disabled:opacity-70"
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  {resendTimer > 0 ? (
                    <span className="flex items-center gap-1">
                      Resend in 
                      <span className="bg-brand-primary/10 px-2 py-0.5 rounded text-[10px] font-mono">
                        {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </AuthContainer>
    </div>
  );
};

export default OTPPage;
