import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";
import { hashOTP } from "../../../utils/encryption";
import jwt from "jsonwebtoken";

export default async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const otpHash = hashOTP(otp);

    // Find the OTP in Supabase
    const { data, error: dbError } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("otp_hash", otpHash)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (dbError || !data) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Mark as used
    const { error: updateError } = await supabase
      .from("email_otps")
      .update({ used: true })
      .eq("id", data.id);

    if (updateError) {
      console.error("Update OTP error:", updateError);
    }

    // Check if user exists, if not create one (or return error if registration is separate)
    // For this implementation, we'll assume we return a JWT for the email
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { email, sub: email }, // Payload
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(200).json({ 
      message: "Verification successful",
      token,
      user: { email } 
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
