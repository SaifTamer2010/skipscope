import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default deleteUser;
