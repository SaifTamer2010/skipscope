import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getOnlineActivity = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    // Define "online" as users with activity in the last 15 minutes
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    // This would require session tracking for users
    // For now, return users who created requests recently
    const { data: recentUsers, error } = await supabase
      .from("requests")
      .select(
        `
        user_id,
        users (
          id,
          email,
          created_at
        ),
        created_at
      `,
      )
      .gte("created_at", fifteenMinutesAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Deduplicate users
    const uniqueUsers = new Map();
    recentUsers?.forEach((r: any) => {
      if (r.users && !uniqueUsers.has(r.user_id)) {
        uniqueUsers.set(r.user_id, {
          ...r.users,
          lastActivity: r.created_at,
        });
      }
    });

    res.json({
      onlineUsers: Array.from(uniqueUsers.values()),
      count: uniqueUsers.size,
    });
  } catch (error: any) {
    console.error("Get online users error:", error);
    res.status(500).json({ error: "Failed to fetch online users" });
  }
};

export default getOnlineActivity;
