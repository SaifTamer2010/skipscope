import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getColumns = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { data: columns, error } = await supabase
      .from("kanban_columns")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json({ columns });
  } catch (error: any) {
    console.error("Get columns error:", error);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
};

export default getColumns;
