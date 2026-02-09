import { Request, Response } from "express";
import * as speakeasy from "speakeasy";
import { supabase } from "../../../config/supabase";
import { decryptSecret } from "../../../utils/encryption";

const completeEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      res.status(400).json({ error: "Username and OTP are required" });
      return;
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !admin || !admin.totp_secret) {
      res.status(401).json({ error: "Invalid enrollment session" });
      return;
    }

    if (admin.is_enrolled) {
      res.status(400).json({ error: "Account already enrolled" });
      return;
    }

    // Decrypt and verify OTP
    const decryptedSecret = decryptSecret(admin.totp_secret);
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token: otp,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      res.status(401).json({ error: "Invalid OTP code" });
      return;
    }

    // Mark as enrolled
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        is_enrolled: true,
        failed_login_attempts: 0,
      })
      .eq("id", admin.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: "Enrollment completed successfully",
    });
  } catch (error: any) {
    console.error("Complete enrollment error:", error);
    res.status(500).json({ error: "Failed to complete enrollment" });
  }
};

export default completeEnrollment;
