import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getUserAnalytics = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get user info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get user's requests
    const { data: requests, error: requestsError } = await supabase
      .from("requests")
      .select(
        `
        *,
        kanban_columns (
          name,
          color
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (requestsError) throw requestsError;

    // Calculate user stats
    const totalRequests = requests?.length || 0;
    const completedRequests =
      requests?.filter((r) => r.kanban_columns?.name === "Completed").length ||
      0;

    const avgCompletionTime =
      (requests
        ?.filter((r) => r.kanban_columns?.name === "Completed")
        .reduce((acc, r) => {
          const created = new Date(r.created_at).getTime();
          const updated = new Date(r.updated_at).getTime();
          return acc + (updated - created);
        }, 0) || 0) / (completedRequests || 1);

    res.json({
      user,
      requests: requests || [],
      stats: {
        totalRequests,
        completedRequests,
        pendingRequests: totalRequests - completedRequests,
        avgCompletionTimeHours: Math.round(
          avgCompletionTime / (1000 * 60 * 60),
        ),
      },
      // Safely calculate avg
    });
  } catch (error: any) {
    console.error("Get user analytics error:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
};

export default getUserAnalytics;
