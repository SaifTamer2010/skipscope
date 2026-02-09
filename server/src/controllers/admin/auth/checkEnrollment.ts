import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const checkEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, username, display_name, is_enrolled, is_active")
      .eq("username", username)
      .single();

    if (error || !admin) {
      // Don't reveal if user exists
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!admin.is_active) {
      res.status(403).json({ error: "Account is disabled" });
      return;
    }

    res.json({
      needsEnrollment: !admin.is_enrolled,
      username: admin.username,
      displayName: admin.display_name,
    });
  } catch (error: any) {
    console.error("Check enrollment error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export default checkEnrollment;
