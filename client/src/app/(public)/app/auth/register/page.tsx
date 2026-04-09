"use client";

import AuthContainer from "@/src/components/ui/auth/authContainer";
import Logo from "@/src/components/ui/logo/logo";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Briefcase, Calendar, Lock, Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Registration states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState("CEO");
  const [age, setAge] = useState("");
  const [company, setCompany] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!username || !email || !phone) {
        toast.error("Please fill in identity fields");
        return;
      }
    }
    setDirection(1);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!password || !confirmPassword) {
      toast.error("Please set a password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role,
            age: age ? parseInt(age) : null,
            phone,
            company,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Direct DB Sync
        const { error: dbError } = await supabase.from("users").upsert({
          id: data.user.id,
          username,
          email,
          phone,
          role,
          age: age ? parseInt(age) : null,
          company,
          settings: { mode: "PRO", notifications: true } // Default settings
        });

        if (dbError) console.error("DB Sync error:", dbError);

        toast.success("Account Sealed. Welcome to Skipscope!");
        
        // Short delay for the feeling of "processing"
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const stepTitle = () => {
    switch (currentStep) {
      case 1: return "Identity Access";
      case 2: return "Professional Profile";
      case 3: return "Security Gate";
      default: return "Join Skipscope";
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black overflow-hidden px-4">
      <Toaster position="top-right" toastOptions={{ style: { background: "#0d0d0d", color: "#f2f2f2", border: "1px solid rgba(255, 255, 255, 0.1)" } }} />

      <AuthContainer>
        <header className="flex justify-center items-center flex-col gap-4 mb-10">
          <Logo />
          <motion.h1
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-text-primary uppercase italic tracking-tighter"
          >
            {stepTitle()}
          </motion.h1>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-500 ${s === currentStep ? "w-8 bg-red-600" : "w-4 bg-white/10"}`}
              />
            ))}
          </div>
        </header>

        <div className="relative w-80 min-h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {currentStep === 1 && (
                <div className="flex flex-col gap-5">
                  <label className="relative block">
                    <input
                      type="text"
                      placeholder="Username"
                      className="bg-black border border-white/10 w-full h-12 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute top-3.5 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                  </label>
                  <label className="relative block">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="bg-black border border-white/10 w-full h-12 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute top-3.5 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                  </label>
                  <label className="relative block">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="bg-black border border-white/10 w-full h-12 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Phone className="absolute top-3.5 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                  </label>
                  <button
                    onClick={handleNext}
                    className="w-full h-14 rounded-xl bg-red-600 shadow-lg shadow-red-900/20 text-white font-black uppercase italic tracking-widest mt-4 hover:bg-red-700 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 italic ml-2">Select Your Role</p>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-black border border-white/10 w-full h-12 rounded-xl px-4 focus:border-red-500/50 outline-none text-text-primary transition-all appearance-none cursor-pointer uppercase font-bold text-sm italic"
                    >
                      <option value="CEO">CEO / Founder</option>
                      <option value="Investor">Real Estate Investor</option>
                      <option value="Realtor">Licensed Realtor</option>
                    </select>
                  </div>

                  <label className="relative block">
                    <input
                      type="number"
                      placeholder="Biological Age"
                      className="bg-black border border-white/10 w-full h-12 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                    <Calendar className="absolute top-3.5 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                  </label>

                  <label className="relative block">
                    <input
                      type="text"
                      placeholder="Company / Agency"
                      className="bg-black border border-white/10 w-full h-12 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <Briefcase className="absolute top-3.5 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                  </label>

                  <div className="flex gap-2">
                    <button onClick={handleBack} className="flex-1 h-14 rounded-xl border border-white/10 text-white/40 font-bold uppercase italic text-xs hover:bg-white/5">Back</button>
                    <button onClick={handleNext} className="flex-[2] h-14 rounded-xl bg-red-600 text-white font-black uppercase italic tracking-widest shadow-lg shadow-red-900/20">Continue</button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col gap-5">
                  <label className="relative block">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Global Password"
                      className="bg-black border border-white/10 w-full h-14 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute top-4 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                    {passwordVisible ? (
                      <EyeOff 
                        size={20} 
                        className="absolute top-4.5 right-5 opacity-40 cursor-pointer"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      />
                    ) : (
                      <Eye 
                        size={20} 
                        className="absolute top-4.5 right-5 opacity-40 cursor-pointer"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      />
                    )}
                  </label>
                  <label className="relative block">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Confirm Security Key"
                      className="bg-black border border-white/10 w-full h-14 rounded-xl px-14 focus:border-red-500/50 outline-none text-text-primary transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock className="absolute top-4 left-5 opacity-40 border-r border-white/5 pr-2" size={20} />
                  </label>

                  <div className="flex gap-2 mt-4">
                    <button onClick={handleBack} className="flex-1 h-14 rounded-xl border border-white/10 text-white/40 font-bold uppercase italic text-xs hover:bg-white/5">Back</button>
                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="flex-[2] h-14 rounded-xl bg-red-600 text-white font-black uppercase italic tracking-widest shadow-lg shadow-red-900/40 disabled:opacity-50"
                    >
                      {loading ? "Establishing..." : "Seal Account"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="mt-12 text-center">
          <button
            type="button"
            onClick={() => router.push("/app/auth/login")}
            className="text-white/20 hover:text-white/50 transition-colors uppercase italic font-bold tracking-tighter text-xs"
          >
            Already a member? Proceed to Login
          </button>
        </footer>
      </AuthContainer>
    </div>
  );
};

export default RegisterPage;
