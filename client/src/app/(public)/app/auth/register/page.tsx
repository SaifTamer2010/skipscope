"use client";

import AuthContainer from "@/src/components/ui/auth/authContainer";
import Logo from "@/src/components/ui/logo/logo";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Registration successful! Please check your email.");
        // Optional: Redirect to login or show a verification message
        setTimeout(() => {
          router.push("/app/auth/login");
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/app/auth/login");
  };

  return (
    <>
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
      <div className="flex justify-center items-center h-screen">
        <AuthContainer>
          <header className="flex justify-center items-center flex-col gap-4">
            <Logo />
            <h1 className="text-2xl font-bold text-text-primary">
              Create Account
            </h1>
          </header>
          <form
            onSubmit={handleRegister}
            className="flex justify-center items-center flex-col gap-6 w-full border-b border-slate-800"
          >
            <label htmlFor="email" className="relative">
              <input
                type="email"
                placeholder="Email"
                id="email"
                value={email}
                className="relative bg-background-main w-80 h-10 rounded-xl p-6 px-15 active:bg-background-main focus:bg-background-main text-text-primary"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Image
                src={"/email.svg"}
                height={30}
                width={30}
                alt={"email"}
                className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-slate-400/60 pr-2 "
              />
            </label>
            <label htmlFor="password" className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                id="password"
                value={password}
                className="relative bg-background-main w-80 h-10 rounded-xl p-6 px-15 text-text-primary"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Image
                src={"/lock.svg"}
                height={30}
                width={30}
                alt={"password"}
                className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-slate-400/60 pr-2"
              />
              <Image
                src={passwordVisible ? "/close-eye.svg" : "/open-eye.svg"}
                height={30}
                width={30}
                alt={"password"}
                className="absolute top-3.5 right-5 z-50 opacity-60 pl-2 cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              />
            </label>
            <label htmlFor="confirmPassword" className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Confirm Password"
                id="confirmPassword"
                value={confirmPassword}
                className="relative bg-background-main w-80 h-10 rounded-xl p-6 px-15 text-text-primary"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Image
                src={"/lock.svg"}
                height={30}
                width={30}
                alt={"password"}
                className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-slate-400/60 pr-2"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-50 h-12 rounded-xl bg-background-third shadow-black shadow-md p-2 cursor-pointer hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <div className="mb-2"></div>
          </form>
          <footer className="">
            <button
              type="button"
              onClick={handleLogin}
              className="w-60 h-12 rounded-xl p-2 cursor-pointer transition-all bg-transparent border border-slate-800 hover:bg-background-third text-text-primary"
            >
              Already have an account?
            </button>
          </footer>
        </AuthContainer>
      </div>
    </>
  );
};

export default RegisterPage;
