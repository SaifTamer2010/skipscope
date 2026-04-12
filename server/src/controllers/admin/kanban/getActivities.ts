import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getActivities = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let query = supabase
      .from("activity_log")
      .select(`
        id,
        created_at,
        action_type,
        action_description,
        metadata,
        request_id,
        admin_id,
        admin_users:admin_id (
          username,
          display_name
        ),
        requests:request_id (
          market,
          state,
          county,
          users (
            email
          )
        )
      `, { count: 'exact' });

    if (startDate) {
      query = query.gte("created_at", new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte("created_at", new Date(endDate).toISOString());
    }

    // Add pagination
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data: activities, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({ 
      activities: activities || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

export default getActivities;
