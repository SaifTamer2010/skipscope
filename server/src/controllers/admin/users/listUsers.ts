import { Request, Response } from "express";
import { supabase } from "../../../config/supabase";

const listUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data: users, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      users,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default listUsers;
