"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_requests: number;
  requests_today: number;
  completed_this_week: number;
  avg_completion_time: number;
  total_revenue: number;
  total_expenses: number;
  total_profit: number;
}

interface TopClient {
  name: string;
  count: number;
}

interface RecentActivity {
  id: string;
  action_type: string;
  created_at: string;
  admin_users?: { display_name: string; username: string };
  requests?: { county: string; id: string };
  metadata?: any;
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
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [daysFilter, setDaysFilter] = useState<string>("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [daysFilter]);

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
    setLoading(true);
    try {
      const { data } = await adminApi.get(`/admin/analytics/dashboard?days=${daysFilter}`);

      setStats(data.stats);
      setStatusData(data.statusData);
      setTimeSeriesData(data.requestsTimeSeries.slice(-parseInt(daysFilter))); 
      setTopClients(data.topClients || [])
      setRecentActivity(data.recentActivity || [])
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center w-full">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Analytics...</p>
      </div>
    );
  }

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-indigo-500 to-indigo-600",
      yellow: "from-amber-400 to-amber-500",
      green: "from-emerald-400 to-emerald-500",
      gray: "from-gray-400 to-gray-500",
    };
    return colors[color] || "from-gray-400 to-gray-500";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black mb-2 flex items-center gap-3">
               <Activity className="text-blue-600" size={28} />
               Platform Overview
            </h1>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Real-time metrics, finances, and system health.</p>
          </div>
          <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Range:</span>
             <select
               value={daysFilter}
               onChange={(e) => setDaysFilter(e.target.value)}
               className="bg-transparent text-sm font-bold text-black focus:outline-none cursor-pointer"
             >
               <option value="7">Last 7 Days</option>
               <option value="14">Last 14 Days</option>
               <option value="30">Last 30 Days</option>
               <option value="90">Last 90 Days</option>
               <option value="365">Last Year</option>
             </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Total Users */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="relative z-10">
               <div className="text-3xl font-bold text-black mb-1 tracking-tight">
                 {stats?.total_users || 0}
               </div>
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Clients</div>
               <div className="text-[10px] font-bold text-blue-500 mt-3 flex items-center gap-1 bg-blue-50 w-max px-2 py-1 rounded-md">
                 <CheckCircle size={10} /> {stats?.active_users || 0} active (30d)
               </div>
            </div>
          </div>

          {/* Total Requests */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="relative z-10">
               <div className="text-3xl font-bold text-black mb-1 tracking-tight">
                 {stats?.total_requests || 0}
               </div>
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</div>
               <div className="text-[10px] font-bold text-indigo-500 mt-3 flex items-center gap-1 bg-indigo-50 w-max px-2 py-1 rounded-md">
                 <Activity size={10} /> {stats?.requests_today || 0} today
               </div>
            </div>
          </div>

          {/* Completed This Week */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="relative z-10">
               <div className="text-3xl font-bold text-black mb-1 tracking-tight">
                 {stats?.completed_this_week || 0}
               </div>
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed Weekly</div>
               <div className="text-[10px] font-bold text-emerald-600 mt-3 flex items-center gap-1 bg-emerald-50 w-max px-2 py-1 rounded-md border border-emerald-100/50">
                 Fulfilled Orders
               </div>
            </div>
          </div>

          {/* Avg Completion Time */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="relative z-10">
               <div className="text-3xl font-bold text-black mb-1 tracking-tight">
                 {Math.round(stats?.avg_completion_time || 0)} <span className="text-lg text-gray-400">HRS</span>
               </div>
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Turnaround</div>
               <div className="text-[10px] font-bold text-purple-600 mt-3 flex items-center gap-1 bg-purple-50 w-max px-2 py-1 rounded-md border border-purple-100/50">
                 Speed & Efficiency
               </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="mb-10">
           <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-bold text-black">Financial Metrics</h2>
              <div className="h-px bg-gray-200 flex-1 ml-4 hidden sm:block"></div>
           </div>
           
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   Gross Revenue
                </h3>
                <span className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600">
                  <DollarSign size={14} strokeWidth={3} />
                </span>
              </div>
              <div className="text-3xl font-bold text-black font-mono tracking-tight">
                ${(stats?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   Total Vendor Cost
                </h3>
                <span className="p-1.5 bg-rose-50 border border-rose-100 rounded-md text-rose-600">
                  <TrendingDown size={14} strokeWidth={3} />
                </span>
              </div>
              <div className="text-3xl font-bold text-black font-mono tracking-tight">
                ${(stats?.total_expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-gray-900 border border-black rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   Net Intelligence Profit
                </h3>
                <span className="p-1.5 bg-emerald-500/20 shadow-inner rounded-md text-emerald-400">
                  <TrendingUp size={14} strokeWidth={3} />
                </span>
              </div>
              <div className={`text-3xl font-bold font-mono tracking-tight relative z-10 ${(stats?.total_profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {(stats?.total_profit || 0) >= 0 ? "+" : "-"}$
                {Math.abs(stats?.total_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-black mb-6 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" /> Pipeline Status Distribution
            </h3>
            <div className="space-y-5">
              {statusData.map((status) => {
                const total = statusData.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (status.count / total) * 100 : 0;

                return (
                  <div key={status.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {status.name}
                      </span>
                      <span className="text-sm font-bold text-black font-mono">
                        {status.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getStatusColor(status.color)} transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requests Over Time */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-black mb-8 uppercase tracking-wider flex items-center gap-2">
               <Activity size={16} className="text-indigo-600" /> Platform Traffic (Last {daysFilter} Days)
            </h3>
            <div className="flex-1 min-h-[220px] flex items-end justify-between gap-1.5 sm:gap-2 px-2 pb-6">
              {timeSeriesData.length === 0 ? (
                 <div className="w-full text-center text-sm font-bold text-gray-400 pb-10">No traffic in this range</div>
              ) : timeSeriesData.map((data, index) => {
                const maxCount = Math.max(
                  ...timeSeriesData.map((d) => d.count),
                  1,
                );
                const height = (data.count / maxCount) * 100;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center h-full justify-end group"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md hover:from-blue-700 hover:to-indigo-500 transition-all cursor-pointer relative shadow-sm border-t border-x border-blue-400/20"
                      style={{
                        height: `${height}%`,
                        minHeight: data.count > 0 ? "8px" : "0px",
                        opacity: data.count > 0 ? 1 : 0
                      }}
                    >
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black px-2.5 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20 transform translate-y-2 group-hover:translate-y-0 pointer-events-none after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-t-black after:border-t-8 after:border-x-transparent after:border-x-8 after:border-b-0">
                        {data.count} Orders
                      </div>
                    </div>
                    {/* Only show dates logic if not crowded */}
                    {timeSeriesData.length <= 14 && (
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3 transform -rotate-45 origin-top-left group-hover:text-black transition-colors whitespace-nowrap">
                        {new Date(data.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {timeSeriesData.length > 14 && (
               <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Showing {timeSeriesData.length} data points</div>
            )}
          </div>
        </div>

        {/* Third Row: Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Clients */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-black mb-6 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-indigo-600" /> Top 5 Active Clients
            </h3>
            <div className="flex-1 space-y-4">
              {topClients.length === 0 ? (
                <p className="text-sm text-gray-400 font-bold">No active clients yet.</p>
              ) : topClients.map((client, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </div>
                    <span className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors truncate max-w-[200px]">
                      {client.name}
                    </span>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Orders:</span>
                    <span className="text-sm font-bold text-black bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                      {client.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-black mb-6 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-emerald-600" /> Recent System Activity
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 font-bold">No recent activities found.</p>
              ) : recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border-l-2 border-l-blue-500 bg-gray-50 rounded-r-xl group hover:bg-blue-50/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <span className="px-1.5 py-0.5 bg-gray-200 text-black rounded uppercase text-[9px]">{activity.action_type.replace(/_/g, ' ')}</span>
                       {activity.admin_users?.display_name || "System"}
                    </p>
                    <p className="text-sm font-bold text-black mb-1 group-hover:text-blue-600 transition-colors">
                       Request #{activity.requests?.id?.slice(0,8)} ({activity.requests?.county || "Unknown Location"})
                    </p>
                    {activity.metadata?.provider_name && (
                       <span className="text-xs text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded mr-2">Provider: {activity.metadata.provider_name}</span>
                    )}
                    {activity.metadata?.column_name && (
                       <span className="text-xs text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded mr-2">Moved To: {activity.metadata.column_name}</span>
                    )}
                     <span className="text-[10px] text-gray-400 font-bold block mt-3">
                       {new Date(activity.created_at).toLocaleString()}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
