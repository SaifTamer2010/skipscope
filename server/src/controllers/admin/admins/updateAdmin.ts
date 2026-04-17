import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

/**
 * Update an admin user (toggle status, change role, or update display name).
 * Restricted to super admins.
 */
const updateAdmin = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { displayName, isSuperAdmin, isActive } = req.body;

    if (!id) {
      res.status(400).json({ error: "Missing admin ID" });
      return;
    }

    // Prevent self-role modification or self-deactivation if needed?
    // For now, allow it but super admins should be careful.
    if (id === req.admin?.id && isActive === false) {
      res.status(400).json({ error: "Cannot deactivate your own account" });
      return;
    }

    const updates: any = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (isSuperAdmin !== undefined) updates.is_super_admin = isSuperAdmin;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: admin, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ admin });
  } catch (error: any) {
    console.error("Update admin error:", error);
    res.status(500).json({ error: "Failed to update admin user" });
  }
};

export default updateAdmin;
