import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, settings, created_at")
      .eq("id", req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getSettings;
