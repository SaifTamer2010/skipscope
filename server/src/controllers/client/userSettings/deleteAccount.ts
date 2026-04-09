import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Delete from public.users (this should cascade if configured correctly, 
    // but our schema shows cascades for requests/notifications from user_id)
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return res.status(500).json({ error: "Failed to delete user record" });
    }

    // 2. Delete from Supabase Auth (using Service Role Key defined in config/supabase)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Auth deletion error:", authError);
      // We don't necessarily return error here if DB entry is already gone, 
      // but it's better to be aware of it.
      return res.status(500).json({ error: "Failed to delete authentication profile" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default deleteAccount;
