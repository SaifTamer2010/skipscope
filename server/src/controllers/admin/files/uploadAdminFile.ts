import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const uploadAdminFile = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId, notes } = req.body;
    const file = req.file;

    if (!requestId || !file) {
      res.status(400).json({ error: "Request ID and file are required" });
      return;
    }

    // Upload to Supabase Storage (admin-files bucket)
    const fileName = `${requestId}/${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("admin-files")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabase
      .from("admin_files")
      .insert({
        request_id: requestId,
        file_name: file.originalname,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.mimetype,
        uploaded_by: req.admin!.id,
        notes: notes || null,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log activity
    await supabase.from("activity_log").insert({
      request_id: requestId,
      admin_id: req.admin!.id,
      action_type: "file_upload",
      action_description: `Uploaded internal file: ${file.originalname}`,
      metadata: {
        file_id: fileRecord.id,
        file_type: "admin",
        file_size: file.size,
      },
    });

    res.json({
      success: true,
      file: fileRecord,
    });
  } catch (error: any) {
    console.error("Upload admin file error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export default uploadAdminFile;
