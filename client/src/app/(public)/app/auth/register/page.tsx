"use client";

import AuthContainer from "@/src/components/ui/auth/authContainer";
import Logo from "@/src/components/ui/logo/logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Briefcase, Calendar, Lock, Eye, EyeOff } from "lucide-react";

const getPasswordStrength = (pass: string) => {
  if (!pass) return 0;
  let score = 0;
  if (pass.length > 5) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Za-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return Math.min(score, 4);
};

const getStrengthColor = (score: number) => {
  if (score === 0) return "bg-white/10";
  if (score === 1) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
  if (score === 2) return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]";
  if (score === 3) return "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]";
  if (score >= 4) return "bg-brand-primary shadow-[0_0_8px_rgba(182,36,36,0.6)]";
};

const getStrengthText = (score: number) => {
  if (score === 0) return "None";
  if (score === 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  if (score >= 4) return "Strong";
};

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Registration states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+20 ");
  const [countryCode, setCountryCode] = useState("EG");
  const [errors, setErrors] = useState({ username: "", email: "", phone: "" });
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  const [role, setRole] = useState("CEO");
  const [age, setAge] = useState("");
  const [company, setCompany] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otp, setOtp] = useState("");

  const handleNext = async () => {
    if (currentStep === 1) {
      setErrors({ username: "", email: "", phone: "" });
      let hasError = false;
      const newErrors = { username: "", email: "", phone: "" };

      if (!username) {
        newErrors.username = "Username is required";
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        newErrors.email = "Email is required";
        hasError = true;
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format";
        hasError = true;
      }

      const rawPhone = phone.replace(/\D/g, "");
      if (!phone || (countryCode === "EG" && rawPhone === "20")) {
        newErrors.phone = "Phone is required";
        hasError = true;
      } else if (countryCode === "US" && rawPhone.length < 10) {
        newErrors.phone = "Invalid US phone format";
        hasError = true;
      } else if (countryCode === "EG" && rawPhone.length < 12) {
        newErrors.phone = "Invalid Egypt phone format";
        hasError = true;
      }

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('check_email_exists', { p_email: email });

        if (error) throw error;

        if (data) {
          setShowDuplicatePopup(true);
          setLoading(false);
          return;
        }

        // No duplicates, safe to go to next step
        setLoading(false);
        setDirection(1);
        setCurrentStep(2);
        return;
      } catch (err: any) {
        console.error("Duplicate check error:", err);
        // Supabase sign-up will still catch it natively on step 3 if this fails
        setLoading(false);
        setDirection(1);
        setCurrentStep(2);
        return;
      }
    } setDirection(1);
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

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 chars, with letter and number");
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
        if (data.session) {
          // If session exists, email confirmations are disabled in Supabase. Skip OTP step!
          const { error: dbError } = await supabase.from("users").upsert({
            id: data.user.id,
            username,
            email,
            phone,
            role,
            age: age ? parseInt(age) : null,
            company,
            settings: { mode: "PRO", notifications: true }
          });
          if (dbError) console.error("DB Sync error:", dbError);
          toast.success("Account Sealed. Welcome to Skipscope!");
          setTimeout(() => router.push("/app/dashboard"), 1500);
        } else {
          // Email confirmation is enabled, wait for OTP
          toast.success("Code sent! Check your email.");
          setDirection(1);
          setCurrentStep(4);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;

      if (data.user) {
        const { error: dbError } = await supabase.from("users").upsert({
          id: data.user.id,
          username,
          email,
          phone,
          role,
          age: age ? parseInt(age) : null,
          company,
          settings: { notifications: true }
        });

        if (dbError) console.error("DB Sync error:", dbError);

        toast.success("Account Sealed. Welcome to Skipscope!");
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP Code");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (countryCode === "EG") {
      if (!value.startsWith("+20")) {
        value = "+20 " + value.replace(/^\+?2?0?/, "");
      }
      const raw = value.slice(3).replace(/\D/g, "").slice(0, 10);
      if (raw.length === 0) setPhone("+20 ");
      else if (raw.length <= 3) setPhone(`+20 ${raw}`);
      else setPhone(`+20 ${raw.slice(0, 3)} ${raw.slice(3, 10)}`);
    } else {
      const p = value.replace(/\D/g, "").slice(0, 10);
      if (p.length === 0) setPhone("");
      else if (p.length <= 3) setPhone(`(${p}`);
      else if (p.length <= 6) setPhone(`(${p.slice(0, 3)}) ${p.slice(3)}`);
      else setPhone(`(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentStep === 1 || currentStep === 2) handleNext();
      else if (currentStep === 3) handleRegister();
      else if (currentStep === 4) handleVerifyOTP();
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
      case 4: return "Verify Email";
      default: return "Join Skipscope";
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-transparent overflow-hidden px-4"
      onKeyDown={handleKeyDown}
    >
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
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-500 ${s === currentStep ? "w-8 bg-brand-primary" : "w-4 bg-border-light"}`}
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
                  <div className="relative block">
                    <input
                      type="text"
                      placeholder="Username"
                      className={`bg-background-third border ${errors.username ? "border-red-500/50" : "border-border-light"} w-full h-12 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className={`absolute top-3.5 left-5 opacity-40 border-r border-border-muted pr-2 ${errors.username && "text-red-500"}`} size={20} />
                    {errors.username && <p className="text-red-500 text-xs mt-1 absolute -bottom-4 left-2">{errors.username}</p>}
                  </div>
                  <div className="relative block mt-2">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className={`bg-background-third border ${errors.email ? "border-red-500/50" : "border-border-light"} w-full h-12 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className={`absolute top-3.5 left-5 opacity-40 border-r border-border-muted pr-2 ${errors.email && "text-red-500"}`} size={20} />
                    {errors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-4 left-2">{errors.email}</p>}
                  </div>
                  <div className="relative block mt-2">
                    <div className="flex gap-2 w-full">
                      <select
                        className={`bg-background-third border ${errors.phone ? "border-red-500/50" : "border-border-light"} w-[70px] shrink-0 h-12 rounded-xl px-2 focus:border-brand-primary/50 outline-none text-text-primary transition-all appearance-none cursor-pointer text-[11px] font-bold`}
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value);
                          setPhone(e.target.value === "EG" ? "+20 " : "");
                        }}
                      >
                        <option value="EG">EG (+20)</option>
                        <option value="US">US (+1)</option>
                      </select>
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="tel"
                          placeholder={countryCode === "EG" ? "+20 XXX XXXXXXX" : "(XXX) XXX-XXXX"}
                          className={`bg-background-third border ${errors.phone ? "border-red-500/50" : "border-border-light"} w-full h-12 rounded-xl pl-10 pr-4 focus:border-brand-primary/50 outline-none text-text-primary transition-all text-sm`}
                          value={phone}
                          onChange={handlePhoneChange}
                        />
                        <Phone className={`absolute top-3.5 left-3 opacity-40 border-r border-border-muted pr-2 ${errors.phone && "text-red-500"}`} size={20} />
                      </div>
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 absolute -bottom-4 left-2">{errors.phone}</p>}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-brand-primary shadow-lg shadow-brand-glow-strong text-text-button font-black uppercase italic tracking-widest mt-6 hover:bg-brand-primary-strong transition-all disabled:opacity-50"
                  >
                    {loading ? "Checking..." : "Next"}
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase font-bold text-text-secondry italic ml-2">Select Your Role</p>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-background-third border border-border-light w-full h-12 rounded-xl px-4 focus:border-brand-primary/50 outline-none text-text-primary transition-all appearance-none cursor-pointer uppercase font-bold text-sm italic"
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
                      className="bg-background-third border border-border-light w-full h-12 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                    <Calendar className="absolute top-3.5 left-5 opacity-40 border-r border-border-muted pr-2" size={20} />
                  </label>

                  <label className="relative block">
                    <input
                      type="text"
                      placeholder="Company / Agency"
                      className="bg-background-third border border-border-light w-full h-12 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <Briefcase className="absolute top-3.5 left-5 opacity-40 border-r border-border-muted pr-2" size={20} />
                  </label>

                  <div className="flex gap-2">
                    <button onClick={handleBack} className="flex-1 h-14 rounded-xl border border-border-light text-text-secondry font-bold uppercase italic text-xs hover:bg-black/5 dark:hover:bg-white/5">Back</button>
                    <button onClick={handleNext} className="flex-[2] h-14 rounded-xl bg-brand-primary text-text-button font-black uppercase italic tracking-widest shadow-lg shadow-brand-glow-strong">Continue</button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col gap-5">
                  <div className="relative block">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Global Password"
                      className="bg-background-third border border-border-light w-full h-14 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute top-4 left-5 opacity-40 border-r border-border-muted pr-2" size={20} />
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
                    {password && (
                      <div className="mt-3 flex items-center justify-between px-2">
                        <div className="flex gap-1 w-full mr-4">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(password) >= level ? getStrengthColor(getPasswordStrength(password)) : 'bg-white/10'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] uppercase font-bold text-text-secondry italic tracking-widest min-w-[50px] text-right">
                          {getStrengthText(getPasswordStrength(password))}
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="relative block">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Confirm Security Key"
                      className="bg-background-third border border-border-light w-full h-14 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock className="absolute top-4 left-5 opacity-40 border-r border-border-muted pr-2" size={20} />
                  </label>

                  <div className="flex gap-2 mt-4">
                    <button onClick={handleBack} className="flex-1 h-14 rounded-xl border border-border-light text-text-secondry font-bold uppercase italic text-xs hover:bg-black/5 dark:hover:bg-white/5">Back</button>
                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="flex-[2] h-14 rounded-xl bg-brand-primary text-text-button font-black uppercase italic tracking-widest shadow-lg shadow-brand-glow-strong disabled:opacity-50"
                    >
                      {loading ? "Establishing..." : "Send Verification"}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex flex-col gap-5">
                  <div className="relative block">
                    <input
                      type="text"
                      placeholder=""
                      className="bg-background-third border border-border-light w-full h-14 rounded-xl px-14 focus:border-brand-primary/50 outline-none text-text-primary transition-all text-center tracking-[0.5em] font-mono text-xl"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                    <Lock className="absolute top-4 left-5 opacity-40 border-r border-border-muted pr-2" size={20} />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={handleBack} className="flex-1 h-14 rounded-xl border border-border-light text-text-secondry font-bold uppercase italic text-xs hover:bg-black/5 dark:hover:bg-white/5">Back</button>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading}
                      className="flex-[2] h-14 rounded-xl bg-brand-primary text-text-button font-black uppercase italic tracking-widest shadow-lg shadow-brand-glow-strong disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify Identity"}
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
            className="text-text-secondry hover:text-text-primary transition-colors uppercase italic font-bold tracking-tighter text-xs"
          >
            Already a member? Proceed to Login
          </button>
        </footer>

      </AuthContainer>
      <AnimatePresence>
        {showDuplicatePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background-third border border-border-light rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl flex flex-col gap-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/50 text-brand-primary">
                  <Mail size={24} />
                </div>
              </div>
              <h3 className="text-xl font-black text-text-primary uppercase italic">Email Registered</h3>
              <p className="text-sm text-text-secondry leading-relaxed">
                This email is already in our system. Did you forget your global password?
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowDuplicatePopup(false)}
                  className="flex-1 h-12 rounded-xl border border-border-light text-text-secondry font-bold uppercase italic text-xs hover:bg-white/5 transition-colors"
                >
                  No, back
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/app/auth/forgot-password")}
                  className="flex-1 h-12 rounded-xl bg-brand-primary text-text-button font-black uppercase italic tracking-widest shadow-lg shadow-brand-glow-strong hover:bg-brand-primary-strong transition-all"
                >
                  Yes, reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
