"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";
import Logo from "@/src/components/ui/logo/logo";

function EnrollmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"loading" | "scan" | "verify">("loading");

  useEffect(() => {
    if (!username) {
      router.push("/admin/login");
      return;
    }

    generateEnrollment();
  }, [username]);

  const generateEnrollment = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.post("/admin/auth/generate-enrollment", {
        username,
      });

      setQrCode(data.qrCode);
      setManualKey(data.manualKey);
      setStep("scan");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to generate enrollment",
      );
      console.error("Generate enrollment error:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await adminApi.post("/admin/auth/complete-enrollment", {
        username,
        otp,
      });

      toast.success("Enrollment completed! You can now login.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid OTP");
      setOtp("");
      console.error("Complete enrollment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualKey);
    toast.success("Secret key copied to clipboard!");
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-500 font-medium">Securing connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tighter">
              <Logo />
            </h1>
            <p className="text-text-primary text-center"><span className="font-bold">Admin</span> panel</p>


          </div>
        </div>

        {/* Enrollment Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900">OTP Enrollment</h2>
            <p className="text-sm text-gray-500 mt-2">
              Setup secure two-factor authentication for{" "}
              <span className="text-black font-semibold">{username}</span>
            </p>
          </div>

          {step === "scan" && (
            <div className="grid md:grid-cols-2 gap-10">
              {/* Step 1: Scan */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 bg-black text-white text-[10px] font-bold rounded-full">1</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Scan QR Code</h3>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-center">
                    {qrCode && (
                      <Image
                        src={qrCode}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-2">Manual Secret Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-black break-all">
                      {manualKey}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Verify */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 bg-black text-white text-[10px] font-bold rounded-full">2</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Verify Setup</h3>
                  </div>

                  <form onSubmit={handleVerifyAndComplete} className="space-y-6">
                    <div>
                      <label htmlFor="otp" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full py-4 px-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {loading ? "Confirming..." : "Complete Setup"}
                    </button>
                  </form>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    <span className="font-bold">Important:</span> Use Google Authenticator or any TOTP app to scan the code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="mt-10 p-4 rounded-xl border border-red-50/50 bg-red-50/30">
            <p className="text-[11px] text-red-700/80 leading-relaxed text-center font-medium">
              🔒 <span className="font-bold uppercase tracking-wider ml-1">Account Recovery Notice:</span> If you lose access to your authenticator device,
              you will need a root administrator to manually reset your secondary verification factor.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/admin/login")}
            className="text-gray-400 hover:text-black transition-colors text-xs font-semibold uppercase tracking-widest"
          >
            ← Cancel and exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEnrollPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </div>
      }
    >
      <EnrollmentContent />
    </Suspense>
  );
}
