import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";
import { hashOTP } from "../../../utils/encryption";
import { sendOTPEmail } from "../../../services/emailService";

export default async function sendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in Supabase
    const { error: dbError } = await supabase.from("email_otps").insert({
      email,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    if (dbError) {
      console.error("Supabase error:", dbError);
      return res.status(500).json({ error: "Failed to store OTP" });
    }

    // Send email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
