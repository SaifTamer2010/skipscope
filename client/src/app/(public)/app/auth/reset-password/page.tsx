"use client";

import AuthContainer from "@/src/components/ui/auth/authContainer";
import Logo from "@/src/components/ui/logo/logo";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Basic check to see if we have a session (handled by callback normally)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired or invalid link. Please try again.");
        setTimeout(() => router.push("/app/auth/forgot-password"), 2000);
      }
    };
    checkSession();
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success("Password updated successfully!");
      
      // Sign out to force fresh login with new password
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push("/app/auth/login");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to reset password");
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
            New Password
          </h1>
          <p className="text-sm text-text-secondry text-center max-w-[280px]">
            Please enter your new password below.
          </p>
        </header>

        <form
          onSubmit={handleResetPassword}
          className="flex justify-center items-center flex-col gap-6 w-full"
        >
          <label htmlFor="password" className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="New Password"
              id="password"
              value={password}
              className="relative bg-black border border-white/10 w-80 h-10 rounded-xl p-6 px-15 focus:border-red-500/50 focus:bg-black outline-none text-text-primary transition-all"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Image
              src={"/lock.svg"}
              height={30}
              width={30}
              alt={"password"}
              className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-white/10 pr-2"
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
              placeholder="Confirm New Password"
              id="confirmPassword"
              value={confirmPassword}
              className="relative bg-black border border-white/10 w-80 h-10 rounded-xl p-6 px-15 focus:border-red-500/50 focus:bg-black outline-none text-text-primary transition-all"
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <Image
              src={"/lock.svg"}
              height={30}
              width={30}
              alt={"password"}
              className="absolute top-3.5 left-5 z-50 opacity-60 border-r border-white/10 pr-2"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-80 h-12 rounded-xl bg-red-600 shadow-lg shadow-red-900/20 p-2 cursor-pointer hover:bg-red-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase italic tracking-tight mt-4"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <footer className="mt-8">
          <button
            type="button"
            onClick={() => router.push("/app/auth/login")}
            className="text-xs text-white/40 hover:text-white/60 transition-colors uppercase italic font-medium"
          >
            Cancel and Return to Login
          </button>
        </footer>
      </AuthContainer>
    </div>
  );
};

export default ResetPasswordPage;
