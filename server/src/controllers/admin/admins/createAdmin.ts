import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

/**
 * Create a new admin user.
 * Restricted to super admins.
 */
const createAdmin = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { username, displayName, isSuperAdmin } = req.body;

    if (!username || !displayName) {
      res.status(400).json({ error: "Username and display name are required" });
      return;
    }

    // Check if username already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .insert({
        username,
        display_name: displayName,
        is_super_admin: !!isSuperAdmin,
        is_active: true,
        is_enrolled: false // Will enroll on first login
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ admin });
  } catch (error: any) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Failed to create admin user" });
  }
};

export default createAdmin;
