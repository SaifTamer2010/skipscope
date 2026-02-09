import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const moveRequest = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { requestId, targetColumnId, newOrder } = req.body;

    if (!requestId || !targetColumnId || newOrder === undefined) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Get current request state
    const { data: currentRequest, error: fetchError } = await supabase
      .from("requests")
      .select("*, kanban_columns(name)")
      .eq("id", requestId)
      .single();

    if (fetchError || !currentRequest) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    const oldColumnId = currentRequest.kanban_column_id;
    const isMovingColumns = oldColumnId !== targetColumnId;

    // Update the request
    const { error: updateError } = await supabase
      .from("requests")
      .update({
        kanban_column_id: targetColumnId,
        kanban_order: newOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // If moving to a different column, log the activity
    if (isMovingColumns) {
      const { data: newColumn } = await supabase
        .from("kanban_columns")
        .select("name")
        .eq("id", targetColumnId)
        .single();
      const status = normalizeStatus(newColumn?.name);
      await supabase
        .from("requests")
        .update({ status: status })
        .eq("id", requestId)
        .select()
        .single();

      await supabase.from("activity_log").insert({
        request_id: requestId,
        admin_id: req.admin!.id,
        action_type: "status_change",
        action_description: `Status changed from "${currentRequest.kanban_columns?.name || "Unknown"}" to "${newColumn?.name || "Unknown"}"`,
        metadata: {
          from_column: oldColumnId,
          to_column: targetColumnId,
          from_column_name: currentRequest.kanban_columns?.name,
          to_column_name: newColumn?.name,
        },
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Move request error:", error);
    res.status(500).json({ error: "Failed to move request" });
  }
};

export default moveRequest;

const normalizeStatus = (columnName: string) => {
  switch (columnName) {
    case "New":
      return "Waiting Confirmation";
    case "Waiting Confirmation":
      return "Waiting Confirmation";
    case "In Progress":
      return "Pending";
    case "Waiting":
      return "Pending";
    case "Completed":
      return "Finished";
    case "Archived":
      return "Cancelled";
    default:
      return "Unknown";
      break;
  }
};
