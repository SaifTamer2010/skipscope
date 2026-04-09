"use client";

import AuthContainer from "@/src/components/ui/auth/authContainer";
import Logo from "@/src/components/ui/logo/logo";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app/auth/callback?next=/app/auth/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Reset link sent! Please check your email.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0d0d0d",
            color: "#f2f2f2",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />
      <AuthContainer>
        <header className="flex justify-center items-center flex-col gap-4">
          <Logo />
          <h1 className="text-3xl font-black text-text-primary uppercase italic tracking-tighter">
            Reset Password
          </h1>
          <p className="text-sm text-text-secondry text-center max-w-[280px]">
            {submitted
              ? "Check your inbox for the link to reset your password."
              : "Enter your email and we'll send you a link to get back into your account."}
          </p>
        </header>

        {!submitted ? (
          <form
            onSubmit={handleResetRequest}
            className="flex justify-center items-center flex-col gap-6 w-full"
          >
            <label htmlFor="email" className="relative">
              <input
                type="email"
                placeholder="Email"
                id="email"
                value={email}
                className="relative bg-black border border-white/10 w-80 h-10 rounded-xl p-6 px-15 focus:border-red-500/50 focus:bg-black outline-none text-text-primary transition-all"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Image
                src={"/email.svg"}
                height={30}
                width={30}
                alt={"email"}
                className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-white/10 pr-2"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-80 h-12 rounded-xl bg-red-600 shadow-lg shadow-red-900/20 p-2 cursor-pointer hover:bg-red-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase italic tracking-tight mt-4"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs text-white/40 hover:text-white/60 transition-colors uppercase italic font-medium"
            >
              Didn't receive email? Try again
            </button>
          </div>
        )}

        <footer className="mt-8">
          <button
            type="button"
            onClick={() => router.push("/app/auth/login")}
            className="w-80 h-12 rounded-xl p-2 cursor-pointer transition-all bg-transparent border border-white/10 hover:bg-white/5 text-text-primary font-bold uppercase italic tracking-tight"
          >
            Back to Login
          </button>
        </footer>
      </AuthContainer>
    </div>
  );
};

export default ForgotPasswordPage;
