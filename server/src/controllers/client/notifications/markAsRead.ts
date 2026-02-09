import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ notification });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default markAsRead;
