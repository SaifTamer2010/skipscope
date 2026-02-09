"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-white">Generating enrollment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">OTP Enrollment</h1>
          <p className="text-gray-400">
            Set up two-factor authentication for{" "}
            <span className="text-purple-400 font-semibold">{username}</span>
          </p>
        </div>

        {/* Enrollment Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {step === "scan" && (
            <>
              {/* Instructions */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Step 1: Scan QR Code
                </h2>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-200 text-sm">
                    <strong>Important:</strong> Use an authenticator app such
                    as:
                  </p>
                  <ul className="mt-2 text-yellow-200 text-sm space-y-1 ml-4 list-disc">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                    <li>Any TOTP-compatible app</li>
                  </ul>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl">
                    {qrCode && (
                      <Image
                        src={qrCode}
                        alt="QR Code"
                        width={256}
                        height={256}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Manual Key */}
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-2">
                    Or enter this key manually:
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-purple-300 font-mono text-sm break-all">
                      {manualKey}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                      title="Copy to clipboard"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Step 2: Verify Setup
                </h2>
                <form onSubmit={handleVerifyAndComplete} className="space-y-6">
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-200 mb-2"
                    >
                      Enter the 6-digit code from your app
                    </label>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
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
                      "Complete Enrollment"
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Warning */}
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-200 text-sm">
              <strong>⚠️ Important:</strong> Save your authenticator app backup!
              If you lose access to your device, you will need a super admin to
              reset your account.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/admin/login")}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to login
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      }
    >
      <EnrollmentContent />
    </Suspense>
  );
}
