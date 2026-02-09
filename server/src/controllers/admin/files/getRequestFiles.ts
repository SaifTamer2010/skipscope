import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getRequestFiles = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId } = req.params;

    // Get admin files
    const { data: adminFiles, error: adminError } = await supabase
      .from("admin_files")
      .select(
        `
        *,
        admin_users (
          username,
          display_name
        )
      `,
      )
      .eq("request_id", requestId)
      .order("uploaded_at", { ascending: false });

    if (adminError) throw adminError;

    // Get client files
    const { data: clientFiles, error: clientError } = await supabase
      .from("client_files")
      .select(
        `
        *,
        admin_users (
          username,
          display_name
        )
      `,
      )
      .eq("request_id", requestId)
      .order("uploaded_at", { ascending: false });

    if (clientError) throw clientError;

    res.json({
      adminFiles: adminFiles || [],
      clientFiles: clientFiles || [],
    });
  } catch (error: any) {
    console.error("Get request files error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

export default getRequestFiles;
