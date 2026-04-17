import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

/**
 * Delete an admin user entirely.
 * Restricted to super admins.
 */
const deleteAdmin = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Missing admin ID" });
      return;
    }

    if (id === req.admin?.id) {
      res.status(400).json({ error: "Cannot delete your own account" });
      return;
    }

    // Check if admin exists
    const { data: admin } = await supabase
      .from("admin_users")
      .select("username")
      .eq("id", id)
      .single();

    if (!admin) {
      res.status(404).json({ error: "Admin user not found" });
      return;
    }

    // Delete sessions first
    await supabase.from("admin_sessions").delete().eq("admin_id", id);
    
    // Delete login logs
    await supabase.from("admin_login_log").delete().eq("admin_id", id);

    // Finally delete the admin
    const { error } = await supabase.from("admin_users").delete().eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: `Admin ${admin.username} deleted successfully` });
  } catch (error: any) {
    console.error("Delete admin error:", error);
    res.status(500).json({ error: "Failed to delete admin user" });
  }
};

export default deleteAdmin;
