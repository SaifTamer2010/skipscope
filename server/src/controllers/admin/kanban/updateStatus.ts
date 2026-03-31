import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const updateStatus = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId, status } = req.body;

    if (!requestId || !status) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate status values (Must match DB check constraint exactly)
    const validStatuses = ["Pending", "Waiting Confirmation", "Finished"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status value. Use: Pending, Waiting Confirmation, or Finished" });
      return;
    }

    const { error: updateError } = await supabase
      .from("requests")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Log activity
    const { error: activityError } = await supabase.from("activity_log").insert({
      request_id: requestId,
      admin_id: req.admin!.id,
      action_type: "status_update",
      action_description: `Request status manually updated to "${status}"`,
      metadata: { new_status: status },
    });

    if (activityError) {
      console.error("Activity log error:", activityError);
      // We still return success as the primary status update worked, 
      // or we could throw. Let's see if this is the failure point.
    }

    res.json({ success: true, message: "Status updated successfully" });
  } catch (error: any) {
    console.error("Update status comprehensive error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    res.status(500).json({ 
      error: "Failed to update status",
      details: error.message 
    });
  }
};

export default updateStatus;
