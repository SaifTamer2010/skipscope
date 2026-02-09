import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getDashboardStats = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    // 1. Calculate stats manually (replacing broken RPC)
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const oneWeekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Parallelize independent queries
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalRequests },
      { count: requestsToday },
      { data: completedRequests },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo), // Approximation of active
      supabase.from("requests").select("*", { count: "exact", head: true }),
      supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),
      supabase
        .from("requests")
        .select("created_at, updated_at, kanban_columns!inner(name)")
        .eq("kanban_columns.name", "Completed"),
    ]);

    // Calculate completion stats
    const completedThisWeek =
      completedRequests?.filter((r) => r.updated_at >= oneWeekAgo).length || 0;

    let avgCompletionTime = 0;
    if (completedRequests && completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((acc, r) => {
        const start = new Date(r.created_at).getTime();
        const end = new Date(r.updated_at).getTime();
        return acc + (end - start);
      }, 0);
      avgCompletionTime =
        totalTime / completedRequests.length / (1000 * 60 * 60); // Hours
    }

    const stats = {
      total_users: totalUsers || 0,
      active_users: activeUsers || 0,
      total_requests: totalRequests || 0,
      requests_today: requestsToday || 0,
      completed_this_week: completedThisWeek,
      avg_completion_time: avgCompletionTime,
    };

    // 2. Get requests over time (last 30 days)
    const { data: requestsOverTime } = await supabase
      .from("requests")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    // Group by date
    const dateGroups: Record<string, number> = {};
    requestsOverTime?.forEach((r) => {
      const date = new Date(r.created_at).toISOString().split("T")[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    const requestsTimeSeries = Object.entries(dateGroups).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    // 3. Get requests by status
    const { data: requestsByStatus } = await supabase.from("requests").select(`
        kanban_column_id,
        kanban_columns (
          name,
          color
        )
      `);

    const statusGroups: Record<
      string,
      { name: string; color: string; count: number }
    > = {};
    requestsByStatus?.forEach((r: any) => {
      const key = r.kanban_column_id || "unknown";
      if (r.kanban_columns) {
        if (!statusGroups[key]) {
          statusGroups[key] = {
            name: r.kanban_columns.name,
            color: r.kanban_columns.color,
            count: 0,
          };
        }
        statusGroups[key].count++;
      }
    });

    const statusData = Object.values(statusGroups);

    // 4. Get top performing admins
    const { data: adminPerformance } = await supabase
      .from("requests")
      .select(
        `
        assigned_admin_id,
        admin_users (
          username,
          display_name
        )
      `,
      )
      .not("assigned_admin_id", "is", null);

    const adminGroups: Record<string, { name: string; count: number }> = {};
    adminPerformance?.forEach((r: any) => {
      const key = r.assigned_admin_id;
      if (key && r.admin_users) {
        if (!adminGroups[key]) {
          adminGroups[key] = {
            name: r.admin_users.display_name,
            count: 0,
          };
        }
        adminGroups[key].count++;
      }
    });

    const topAdmins = Object.values(adminGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 5. Get recent activity
    const { data: recentActivity } = await supabase
      .from("activity_log")
      .select(
        `
        *,
        admin_users (
          username,
          display_name
        ),
        requests (
          id,
          county
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20);

    // 6. Removed Package distribution (column does not exist)
    const packageData: any[] = [];

    res.json({
      stats,
      requestsTimeSeries,
      statusData,
      topAdmins,
      packageData,
      recentActivity: recentActivity || [],
    });
  } catch (error: any) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export default getDashboardStats;
