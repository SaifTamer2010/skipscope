import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("token", token)
      .single();

    if (error || !session) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from("admin_sessions").delete().eq("token", token);
      res.status(401).json({ error: "Token expired" });
      return;
    }

    res.json({
      valid: true,
      admin: {
        id: session.admin_users.id,
        username: session.admin_users.username,
        displayName: session.admin_users.display_name,
        isSuperAdmin: session.admin_users.is_super_admin,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "Server error during verification" });
  }
};

export default verify;
