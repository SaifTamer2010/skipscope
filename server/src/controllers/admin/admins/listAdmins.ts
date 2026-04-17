import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

/**
 * List all admin users.
 * Restricted to super admins.
 */
const listAdmins = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { data: admins, error } = await supabase
      .from("admin_users")
      .select("id, username, display_name, is_super_admin, is_active, last_login, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ admins });
  } catch (error: any) {
    console.error("List admins error:", error);
    res.status(500).json({ error: "Failed to fetch admin users" });
  }
};

export default listAdmins;
