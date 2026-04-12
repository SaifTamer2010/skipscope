import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const assignProviderRequest = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId, providerId } = req.body;

    if (!requestId) {
      res.status(400).json({ error: "Request ID is required" });
      return;
    }

    // If providerId is null, we're unassigning
    const { error: updateError } = await supabase
      .from("requests")
      .update({
        provider_id: providerId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Log activity
    const actionDesc = providerId 
      ? `Assigned provider to request` 
      : `Unassigned provider from request`;
      
    await supabase.from("activity_log").insert({
      request_id: requestId,
      admin_id: req.admin!.id,
      action_type: "provider_assigned",
      action_description: actionDesc,
      metadata: { provider_id: providerId }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Assign provider error:", error);
    res.status(500).json({ error: "Failed to assign provider" });
  }
};

export default assignProviderRequest;
