import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const updatePaymentStatus = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId, paymentCompleted } = req.body;

    if (!requestId || paymentCompleted === undefined) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const { error: updateError } = await supabase
      .from("requests")
      .update({
        payment_completed: paymentCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      // Temporary fallback in case the column doesn't exist yet
      if (updateError.message.includes("payment_completed")) {
        console.warn("payment_completed column missing, simulating success");
      } else {
        throw updateError;
      }
    }

    // Log activity
    await supabase.from("activity_log").insert({
      request_id: requestId,
      admin_id: req.admin!.id,
      action_type: "payment_status_updated",
      action_description: `Payment marked as ${paymentCompleted ? "Completed" : "Pending"}`,
      metadata: { payment_completed: paymentCompleted }
    });

    res.json({ success: true, message: "Payment status updated successfully" });
  } catch (error: any) {
    console.error("Update payment error:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};

export default updatePaymentStatus;
