"use client";

import AuthContainer from "@/components/ui/auth/authContainer"; // Check path alias
import Logo from "@/components/ui/logo/logo";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";

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
            <h1 className="text-2xl font-bold text-text-primary">Login</h1>
          </header>
          <form
            onSubmit={handleLogin}
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
                className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-slate-400/60 pr-2"
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

            <div className="flex items-center w-80 gap-2">
              <input
                type="checkbox"
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-bg-background-third focus:ring-indigo-500"
              />
              <label
                htmlFor="keepLoggedIn"
                className="text-sm text-text-secondry cursor-pointer select-none"
              >
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-50 h-12 rounded-xl bg-background-third shadow-black shadow-md p-2 cursor-pointer hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-right text-sm w-full text-slate-200 mb-2">
              Forget Password?
            </p>
          </form>
          <footer className="">
            <button
              type="button"
              onClick={handleRegister}
              className="w-50 h-12 rounded-xl p-2 cursor-pointer transition-all bg-transparent border border-slate-800 hover:bg-background-third text-text-primary"
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
