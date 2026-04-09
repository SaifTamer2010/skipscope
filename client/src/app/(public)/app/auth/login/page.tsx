"use client";

import AuthContainer from "@/components/ui/auth/authContainer"; // Check path alias
import Logo from "@/components/ui/logo/logo";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";

const page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false); // Default to session only

  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Set persistence based on checkbox
      window.localStorage.setItem("ss-persist", keepLoggedIn.toString());

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        toast.success("Login successful!");
        router.refresh(); // Refresh to update middleware/layout state if any
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 500);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/app/auth/register");
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-transparent">
        <AuthContainer>
          <header className="flex justify-center items-center flex-col gap-4">
            <Logo />
            <h1 className="text-3xl font-black text-text-primary uppercase italic tracking-tighter">Login</h1>
          </header>
          <form
            onSubmit={handleLogin}
            className="flex justify-center items-center flex-col gap-6 w-full border-b border-white/5 pb-8"
          >
            <label htmlFor="email" className="relative">
              <input
                type="email"
                placeholder="Email"
                id="email"
                value={email}
                className="relative bg-background-third border border-border-light w-80 h-10 rounded-xl p-6 px-15 focus:border-brand-primary/50 focus:bg-background-main outline-none text-text-primary transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-border-muted pr-2" size={20} />
            </label>
            <label htmlFor="password" className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                id="password"
                value={password}
                className="relative bg-background-third border border-border-light w-80 h-10 rounded-xl p-6 px-15 focus:border-brand-primary/50 focus:bg-background-main outline-none text-text-primary transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-border-muted pr-2" size={20} />
              {passwordVisible ? (
                <EyeOff
                  size={20}
                  className="absolute top-3.5 right-5 z-50 opacity-60 pl-2 cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                />
              ) : (
                <Eye
                  size={20}
                  className="absolute top-3.5 right-5 z-50 opacity-60 pl-2 cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                />
              )}
            </label>

            <div className="flex items-center w-80 gap-3">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="sr-only peer"
                />
                <label
                  htmlFor="keepLoggedIn"
                  className="w-5 h-5 rounded-md bg-background-third border-border-light border cursor-pointer hover:bg-white/5 peer-checked:bg-brand-primary peer-checked:border-brand-primary-strong peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary/50 shadow-inner transition-all flex items-center justify-center overflow-hidden"
                >
                  <AnimatePresence>
                    {keepLoggedIn && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "backOut" }}
                      >
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15, ease: "backOut" }}
                          className="flex items-center justify-center w-full h-full"
                        >
                          <Zap className="text-text-button fill-text-button" size={12} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>
              </div>
              <label
                htmlFor="keepLoggedIn"
                className="text-sm text-text-secondry cursor-pointer select-none peer-focus-visible:text-white transition-colors"
              >
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-80 h-12 rounded-xl bg-brand-primary shadow-lg shadow-brand-glow-strong p-2 cursor-pointer hover:bg-brand-primary-strong hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-button font-bold uppercase italic tracking-tight mt-4"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <p
              onClick={() => router.push("/app/auth/forgot-password")}
              className="text-right text-xs w-full text-white/40 mb-2 cursor-pointer hover:text-white/60 transition-colors uppercase italic font-medium"
            >
              Forgot Password?
            </p>
          </form>
          <footer className="">
            <button
              type="button"
              onClick={handleRegister}
              className="w-80 h-12 rounded-xl p-2 cursor-pointer transition-all bg-transparent border border-white/10 hover:bg-white/5 text-text-primary font-bold uppercase italic tracking-tight"
            >
              Create New Account
            </button>
          </footer>
        </AuthContainer>
      </div>
    </>
  );
};

export default page;
