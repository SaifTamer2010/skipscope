import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

/**
 * Permanently delete a request and all associated data.
 * Restricted to super admins only.
 */
const hardDeleteRequest = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Missing request ID" });
      return;
    }

    // Safety Check: Already checked by superadmin middleware on route, 
    // but we can double-check the session here if needed.
    if (!req.admin?.isSuperAdmin) {
      res.status(403).json({ error: "Super admin privileges required for hard delete" });
      return;
    }

    console.log(`[Admin: ${req.admin.displayName}] Hard deleting request: ${id}`);

    // Delete associated files (Supabase will handle the DB rows if cascaded, 
    // but the actual storage files might need manual cleanup if those are managed elsewhere).
    // For now, focus on DB data.
    
    // Deletions order (if not cascaded):
    // 1. Files
    await supabase.from("admin_files").delete().eq("request_id", id);
    await supabase.from("client_files").delete().eq("request_id", id);
    
    // 2. Activity / Notifications
    await supabase.from("activity_log").delete().eq("request_id", id);
    await supabase.from("notifications").delete().eq("request_id", id);
    
    // 3. Final: The request itself
    const { error: deleteError } = await supabase
      .from("requests")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Log the deletion itself with null request_id since the record is completely gone
    await supabase.from("activity_log").insert({
      request_id: null,
      admin_id: req.admin!.id,
      action_type: "request_deleted",
      action_description: `Permanently deleted request ${id}`,
      metadata: { deleted_request_id: id }
    });

    res.json({ success: true, message: "Request permanently deleted" });
  } catch (error: any) {
    console.error("Hard delete request error:", error);
    res.status(500).json({ error: "Failed to permanently delete request" });
  }
};

export default hardDeleteRequest;
