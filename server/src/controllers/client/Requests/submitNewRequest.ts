import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const submitNewRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { county, rows, motivation, customNotes } = req.body;

    if (!county || !rows || !motivation) {
      return res.status(400).json({ error: "All Fields are required" });
    }

    // Get the default kanban column (first one)
    const { data: defaultColumn } = await supabase
      .from("kanban_columns")
      .select("id")
      .order("order_index", { ascending: true })
      .limit(1)
      .single();

    // Create new request
    const { data: newRequest, error } = await supabase
      .from("requests")
      .insert({
        user_id: req.userId,
        county,
        rows,
        motivations: motivation,
        customNotes,
        status: "Pending",
        kanban_column_id: defaultColumn?.id, // Assign to first column
        kanban_order: 0, // Add to top
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create a notification for the new request
    await supabase.from("notifications").insert({
      user_id: req.userId,
      message: `Your request for ${county} has been submitted and is pending.`,
      is_read: false,
    });

    res.status(201).json({
      request: newRequest,
      message: "Request submitted successfully",
    });
  } catch (error) {
    console.error("Submit request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default submitNewRequest;