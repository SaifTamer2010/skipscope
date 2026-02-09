import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getRequestDetails = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: request, error } = await supabase
      .from("requests")
      .select(
        `
        *,
        users (
          id,
          email,
          created_at
        ),
        admin_users (
          id,
          username,
          display_name
        ),
        kanban_columns (
          id,
          name,
          color
        ),
        admin_files (
          id,
          file_name,
          file_size,
          file_type,
          uploaded_at,
          notes,
          uploaded_by,
          admin_users (
            username,
            display_name
          )
        ),
        client_files (
          id,
          file_name,
          file_size,
          file_type,
          uploaded_at,
          is_visible_to_client,
          notes,
          uploaded_by,
          admin_users (
            username,
            display_name
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    // Get activity log
    const { data: activity } = await supabase
      .from("activity_log")
      .select(
        `
        *,
        admin_users (
          username,
          display_name
        )
      `,
      )
      .eq("request_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    res.json({
      request,
      activity: activity || [],
    });
  } catch (error: any) {
    console.error("Get request details error:", error);
    res.status(500).json({ error: "Failed to fetch request details" });
  }
};

export default getRequestDetails;
