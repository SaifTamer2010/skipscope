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
    const daysParam = parseInt(req.query.days as string) || 30;
    const rangeAgo = new Date(
      now.getTime() - daysParam * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Parallelize independent queries
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalRequests },
      { count: requestsToday },
      { data: completedRequests },
      { data: financials },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", rangeAgo), // Approximation of active
      supabase.from("requests").select("*", { count: "exact", head: true }),
      supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),
      supabase
        .from("requests")
        .select("created_at, updated_at, kanban_columns!inner(name)")
        .eq("kanban_columns.name", "Completed"),
      supabase.from("requests").select("invoice_amount, expenses, profit"),
    ]);

    // Calculate financial totals
    let total_revenue = 0;
    let total_expenses = 0;
    let total_profit = 0;
    
    financials?.forEach((req) => {
      total_revenue += Number(req.invoice_amount || 0);
      total_expenses += Number(req.expenses || 0);
      total_profit += Number(req.profit || 0);
    });

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
      total_revenue,
      total_expenses,
      total_profit,
    };

    // 2. Get requests over time (range)
    const { data: requestsOverTime } = await supabase
      .from("requests")
      .select("created_at")
      .gte("created_at", rangeAgo)
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

    // 4. Get top clients
    const { data: clientPerformance } = await supabase
      .from("requests")
      .select(
        `
        user_id,
        users (
          email
        )
      `,
      )
      .not("user_id", "is", null);

    const clientGroups: Record<string, { name: string; count: number }> = {};
    clientPerformance?.forEach((r: any) => {
      const key = r.user_id;
      if (key && r.users) {
        if (!clientGroups[key]) {
          clientGroups[key] = {
            name: r.users.email,
            count: 0,
          };
        }
        clientGroups[key].count++;
      }
    });

    const topClients = Object.values(clientGroups)
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
      topClients,
      packageData,
      recentActivity: recentActivity || [],
    });
  } catch (error: any) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export default getDashboardStats;
