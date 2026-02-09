import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    console.log(
      `Processing download for fileId: ${fileId} by user: ${req.userId}`,
    );

    // Get file metadata and check ownership via request
    const { data: file, error: fileError } = await supabase
      .from("client_files")
      .select("*, requests!inner(user_id)")
      .eq("id", fileId)
      .eq("is_visible_to_client", true)
      .eq("requests.user_id", req.userId)
      .single();

    if (fileError || !file) {
      console.error("File lookup failed:", fileError);
      res.status(404).json({ error: "File not found or access denied" });
      return;
    }

    // Generate signed URL (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("client-files")
      .createSignedUrl(file.file_path, 3600);

    if (urlError) throw urlError;

    res.json({
      downloadUrl: urlData.signedUrl,
      fileName: file.file_name,
    });
  } catch (error: any) {
    console.error("Download file error:", error);
    res.status(500).json({ error: "Failed to generate download link" });
  }
};

export default downloadFile;
