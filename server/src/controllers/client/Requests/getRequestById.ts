import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: request, error } = await supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.userId)
      .single();

    if (error || !request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Fetch client-visible files
    const { data: files } = await supabase
      .from("client_files")
      .select("*")
      .eq("request_id", id)
      .eq("is_visible_to_client", true);

    res.json({ request: { ...request, files: files || [] } });
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getRequestById;
