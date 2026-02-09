import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const toggleFileVisibility = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { fileId } = req.params;
    const { isVisibleToClient } = req.body;

    if (isVisibleToClient === undefined) {
      res.status(400).json({ error: "isVisibleToClient is required" });
      return;
    }

    // Get current file
    const { data: file, error: fetchError } = await supabase
      .from("client_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError || !file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Update visibility
    const { error: updateError } = await supabase
      .from("client_files")
      .update({ is_visible_to_client: isVisibleToClient })
      .eq("id", fileId);

    if (updateError) throw updateError;

    // Log activity
    await supabase.from("activity_log").insert({
      request_id: file.request_id,
      admin_id: req.admin!.id,
      action_type: "file_visibility_change",
      action_description: `Changed visibility of ${file.file_name} to ${isVisibleToClient ? "visible" : "hidden"}`,
      metadata: {
        file_id: fileId,
        new_visibility: isVisibleToClient,
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Update file visibility error:", error);
    res.status(500).json({ error: "Failed to update visibility" });
  }
};

export default toggleFileVisibility;
