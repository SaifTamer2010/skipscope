import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "User not found" });

    // Fetch their requests
    const { data: requests } = await supabase
      .from("requests")
      .select(
        `
        id,
        title,
        status,
        created_at,
        kanban_columns ( name, color )
      `,
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    return res.status(200).json({ user, requests: requests || [] });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default getUser;
