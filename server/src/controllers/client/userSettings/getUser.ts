import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("id", req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get request statistics
    const { data: requests } = await supabase
      .from("requests")
      .select("status")
      .eq("user_id", req.userId);

    const stats = {
      total: requests?.length || 0,
      pending: requests?.filter((r: any) => r.status === "Pending").length || 0,
      waiting:
        requests?.filter((r: any) => r.status === "Waiting Confirmation")
          .length || 0,
      finished:
        requests?.filter((r: any) => r.status === "Finished").length || 0,
    };

    res.json({ user, stats });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getUser;
