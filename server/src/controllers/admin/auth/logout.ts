import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      await supabase.from("admin_sessions").delete().eq("token", token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

export default logout;
