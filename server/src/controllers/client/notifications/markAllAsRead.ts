import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.userId)
      .eq("is_read", false);

    if (error) {
      throw error;
    }

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default markAllAsRead;
