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

    // Optional: Log activity if there is an activity log constraint for providers later

    res.json({ success: true });
  } catch (error: any) {
    console.error("Assign provider error:", error);
    res.status(500).json({ error: "Failed to assign provider" });
  }
};

export default assignProviderRequest;
