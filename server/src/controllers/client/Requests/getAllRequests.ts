import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const getAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { data: requests, error } = await supabase
      .from("requests")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getAllRequests;
