import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const deleteFile = async (req: AdminRequest, res: Response): Promise<void> => {
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

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([file.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from(table)
      .delete()
      .eq("id", fileId);

    if (dbError) throw dbError;

    // Log activity
    await supabase.from("activity_log").insert({
      request_id: file.request_id,
      admin_id: req.admin!.id,
      action_type: "file_delete",
      action_description: `Deleted ${type} file: ${file.file_name}`,
      metadata: {
        file_id: fileId,
        file_type: type,
        file_name: file.file_name,
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

export default deleteFile;
