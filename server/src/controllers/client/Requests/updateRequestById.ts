import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const updateRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: updatedRequest, error } = await supabase
      .from("requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ request: updatedRequest });
  } catch (error) {
    console.error("Update request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default updateRequestById;
