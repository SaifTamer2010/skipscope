import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ error: "Settings are required" });
    }

    const { username, company, phone, age, ...restSettings } = settings;

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ 
        username,
        company,
        phone,
        age: age ? parseInt(age.toString()) : null,
        settings: restSettings 
      })
      .eq("id", req.userId)
      .select("id, email, username, company, phone, age, settings, created_at")
      .single();

    if (error) {
      throw error;
    }

    res.json({ user: updatedUser, message: "Settings updated successfully" });
  } catch (error) {

    console.error("Update user settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default updateSettings;
