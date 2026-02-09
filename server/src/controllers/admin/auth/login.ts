import { Request, Response } from "express";
import * as speakeasy from "speakeasy";
import crypto from "crypto";
import { supabase } from "../../../config/supabase";
import { decryptSecret } from "../../../utils/encryption";

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, otp, ipAddress, userAgent } = req.body;

    if (!username || !otp) {
      res.status(400).json({ error: "Username and OTP are required" });
      return;
    }

    // Get admin user
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single();

    // Log failed attempt if user doesn't exist
    if (error || !admin) {
      await supabase.from("admin_login_log").insert({
        username,
        success: false,
        failure_reason: "Invalid username",
        ip_address: ipAddress,
        user_agent: userAgent,
      });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      await supabase.from("admin_login_log").insert({
        admin_id: admin.id,
        username,
        success: false,
        failure_reason: "Account locked",
        ip_address: ipAddress,
        user_agent: userAgent,
      });
      res.status(403).json({ error: "Account is temporarily locked" });
      return;
    }

    // Check if active
    if (!admin.is_active) {
      await supabase.from("admin_login_log").insert({
        admin_id: admin.id,
        username,
        success: false,
        failure_reason: "Account disabled",
        ip_address: ipAddress,
        user_agent: userAgent,
      });
      res.status(403).json({ error: "Account is disabled" });
      return;
    }

    // Check if enrolled
    if (!admin.is_enrolled || !admin.totp_secret) {
      res.status(400).json({ error: "Account not enrolled" });
      return;
    }

    // Verify OTP
    const decryptedSecret = decryptSecret(admin.totp_secret);
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token: otp,
      window: 1, // Less lenient for login
    });

    if (!verified) {
      // Increment failed attempts
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1;
      const updates: any = { failed_login_attempts: newFailedAttempts };

      // Lock account after 5 failed attempts for 15 minutes
      if (newFailedAttempts >= 5) {
        updates.locked_until = new Date(
          Date.now() + 15 * 60 * 1000,
        ).toISOString();
      }

      await supabase.from("admin_users").update(updates).eq("id", admin.id);

      await supabase.from("admin_login_log").insert({
        admin_id: admin.id,
        username,
        success: false,
        failure_reason: "Invalid OTP",
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      res.status(401).json({ error: "Invalid OTP code" });
      return;
    }

    // Success! Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    await supabase.from("admin_sessions").insert({
      admin_id: admin.id,
      token: sessionToken,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    // Reset failed attempts and update last login
    await supabase
      .from("admin_users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", admin.id);

    // Log successful login
    await supabase.from("admin_login_log").insert({
      admin_id: admin.id,
      username,
      success: true,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    res.json({
      success: true,
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.display_name,
        isSuperAdmin: admin.is_super_admin,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

export default login;
