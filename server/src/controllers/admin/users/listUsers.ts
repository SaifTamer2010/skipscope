import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const listUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default listUsers;
