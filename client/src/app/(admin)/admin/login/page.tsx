"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsEnrollment, setNeedsEnrollment] = useState(false);

  const handleCheckEnrollment = async () => {
    if (!username) {
      toast.error("Please enter your username");
      return;
    }

    setLoading(true);
    try {
      const { data } = await adminApi.post("/admin/auth/check-enrollment", {
        username,
      });

      if (data.needsEnrollment) {
        setNeedsEnrollment(true);
        router.push(
          `/admin/app/enroll?username=${encodeURIComponent(username)}`,
        );
      } else {
        setNeedsEnrollment(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid username");
      console.error("Check enrollment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !otp) {
      toast.error("Please enter username and OTP");
      return;
    }

    setLoading(true);
    try {
      const { data } = await adminApi.post("/admin/auth/login", {
        username,
        otp,
        ipAddress: null, // Will be set by server in production
        userAgent: navigator.userAgent,
      });

      // Store token
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));

      toast.success("Login successful!");
      router.push("/admin/app/dashboard");
    } catch (error: any) {
      if (error.response?.data?.error === "Account not enrolled") {
        setNeedsEnrollment(true);
        router.push(
          `/admin/app/enroll?username=${encodeURIComponent(username)}`,
        );
        return;
      }
      toast.error(error.response?.data?.error || "Login failed");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="relative w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="relative w-10 h-10">
            <Image
              src="/scope.svg"
              alt="SkipScope Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tighter">
            adminpanel
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Please enter your credentials to access the panel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleCheckEnrollment}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="admin_id"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* OTP Input */}
            {!needsEnrollment && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Authenticator Code
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="000000"
                  disabled={loading || !username}
                  autoComplete="one-time-code"
                />
                <p className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enter the 6-digit code from your app
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !otp}
              className="w-full py-4 px-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
            Secure Infrastructure • SkipScope OS
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 underline underline-offset-4 decoration-gray-200">Help Center</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1 underline underline-offset-4 decoration-gray-200">Security Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
