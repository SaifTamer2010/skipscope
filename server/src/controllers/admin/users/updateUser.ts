import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email is required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default updateUser;
