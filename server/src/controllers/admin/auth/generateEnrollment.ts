import { Request, Response } from "express";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { supabase } from "../../../config/supabase";
import { encryptSecret } from "../../../utils/encryption";

const generateEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (admin.is_enrolled) {
      res.status(400).json({ error: "Account already enrolled" });
      return;
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `SkipScope Admin (${username})`,
      issuer: "SkipScope",
      length: 32,
    });

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    // Temporarily store the secret (encrypted) for verification
    const encryptedSecret = encryptSecret(secret.base32);

    // Update admin with encrypted secret (not enrolled yet)
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ totp_secret: encryptedSecret })
      .eq("id", admin.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      qrCode: qrCodeDataUrl,
      manualKey: secret.base32,
      username: admin.username,
    });
  } catch (error: any) {
    console.error("Generate enrollment error:", error);
    res.status(500).json({ error: "Failed to generate enrollment data" });
  }
};

export default generateEnrollment;
