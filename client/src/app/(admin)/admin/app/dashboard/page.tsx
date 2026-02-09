"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/src/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import Image from "next/image";
import adminApi from "@/lib/adminApi";

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_requests: number;
  requests_today: number;
  completed_this_week: number;
  avg_completion_time: number;
}

interface StatusData {
  name: string;
  color: string;
  count: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
    fetchAnalytics();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      await adminApi.get("/admin/auth/verify");
    } catch (error) {
      console.error("Auth verification error:", error);
      router.push("/admin/login");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await adminApi.get("/admin/analytics/dashboard");

      setStats(data.stats);
      setStatusData(data.statusData);
      setTimeSeriesData(data.requestsTimeSeries.slice(-14)); // Last 14 days
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      yellow: "from-yellow-500 to-yellow-600",
      green: "from-green-500 to-green-600",
      gray: "from-gray-500 to-gray-600",
    };
    return colors[color] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white ">
      {/* Header */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.total_users || 0}
            </div>
            <div className="text-sm text-gray-400">Total Users</div>
            <div className="text-xs text-purple-400 mt-2">
              {stats?.active_users || 0} active (30d)
            </div>
          </div>

          {/* Total Requests */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.total_requests || 0}
            </div>
            <div className="text-sm text-gray-400">Total Requests</div>
            <div className="text-xs text-blue-400 mt-2">
              {stats?.requests_today || 0} today
            </div>
          </div>

          {/* Completed This Week */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.completed_this_week || 0}
            </div>
            <div className="text-sm text-gray-400">Completed This Week</div>
          </div>

          {/* Avg Completion Time */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(stats?.avg_completion_time || 0)}h
            </div>
            <div className="text-sm text-gray-400">Avg Completion Time</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Requests by Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Requests by Status
            </h3>
            <div className="space-y-4">
              {statusData.map((status) => {
                const total = statusData.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (status.count / total) * 100 : 0;

                return (
                  <div key={status.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">
                        {status.name}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {status.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(status.color)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requests Over Time */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Requests (Last 14 Days)
            </h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {timeSeriesData.map((data, index) => {
                const maxCount = Math.max(
                  ...timeSeriesData.map((d) => d.count),
                  1,
                );
                const height = (data.count / maxCount) * 100;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t hover:from-purple-500 hover:to-pink-400 transition-all cursor-pointer relative group"
                      style={{
                        height: `${height}%`,
                        minHeight: data.count > 0 ? "4px" : "0",
                      }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count} requests
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push("/admin/kanban")}
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl p-6 text-left transition-all transform hover:scale-[1.02]"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Kanban Board</h3>
            <p className="text-sm text-purple-100">Manage requests visually</p>
          </button>

          <button
            onClick={fetchAnalytics}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-6 text-left transition-all transform hover:scale-[1.02]"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Refresh Data</h3>
            <p className="text-sm text-blue-100">Update analytics</p>
          </button>

          <button
            onClick={() => router.push("/admin/app/users")}
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl p-6 text-left transition-all transform hover:scale-[1.02]"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">User Management</h3>
            <p className="text-sm text-green-100">View all users</p>
          </button>
        </div>
      </div>
    </div>
  );
}
