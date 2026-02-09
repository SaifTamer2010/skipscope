import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const assignRequest = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId, adminId } = req.body;

    if (!requestId) {
      res.status(400).json({ error: "Request ID is required" });
      return;
    }

    // If adminId is null, we're unassigning
    const { error: updateError } = await supabase
      .from("requests")
      .update({
        assigned_admin_id: adminId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Log activity
    let actionDescription = adminId
      ? `Assigned to ${req.admin!.displayName}`
      : "Unassigned";

    if (adminId && adminId !== req.admin!.id) {
      const { data: assignedAdmin } = await supabase
        .from("admin_users")
        .select("display_name")
        .eq("id", adminId)
        .single();

      if (assignedAdmin) {
        actionDescription = `Assigned to ${assignedAdmin.display_name}`;
      }
    }

    await supabase.from("activity_log").insert({
      request_id: requestId,
      admin_id: req.admin!.id,
      action_type: "assigned",
      action_description: actionDescription,
      metadata: { assigned_to: adminId },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Assign request error:", error);
    res.status(500).json({ error: "Failed to assign request" });
  }
};

export default assignRequest;
