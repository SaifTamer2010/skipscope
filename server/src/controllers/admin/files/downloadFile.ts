import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const downloadFile = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { fileId, type } = req.params;

    if (type !== "admin" && type !== "client") {
      res.status(400).json({ error: "Invalid file type" });
      return;
    }

    const table = type === "admin" ? "admin_files" : "client_files";
    const bucket = type === "admin" ? "admin-files" : "client-files";

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from(table)
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError || !file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Generate signed URL (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
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
