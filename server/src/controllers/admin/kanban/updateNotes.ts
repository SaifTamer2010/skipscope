import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";
import { NotificationService } from "../../../services/notificationService";

const updateNotes = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { requestId, internalNotes, clientNotes } = req.body;

    if (!requestId) {
      res.status(400).json({ error: "Request ID is required" });
      return;
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (internalNotes !== undefined) updates.internal_notes = internalNotes;
    if (clientNotes !== undefined) updates.client_notes = clientNotes;

    const { error: updateError } = await supabase
      .from("requests")
      .update(updates)
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Log activity
    const noteType = internalNotes !== undefined ? "internal" : "client";
    const noteDescription =
      internalNotes !== undefined && clientNotes !== undefined
        ? "Updated internal and client notes"
        : `Updated ${noteType} notes`;

    await supabase.from("activity_log").insert({
      request_id: requestId,
      admin_id: req.admin!.id,
      action_type: "note_added",
      action_description: noteDescription,
      metadata: { note_type: noteType },
    });

    // Send notification to user if client notes were updated
    if (clientNotes !== undefined) {
      const { data: request } = await supabase
        .from("requests")
        .select("user_id")
        .eq("id", requestId)
        .single();

      if (request) {
        await NotificationService.notifyNotesUpdated(
          request.user_id,
          requestId,
          "client",
        );
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Update notes error:", error);
    res.status(500).json({ error: "Failed to update notes" });
  }
};

export default updateNotes;
