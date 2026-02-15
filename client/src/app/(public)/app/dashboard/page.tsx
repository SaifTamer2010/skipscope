"use client";

// we are going to remove the wiating confirmation with pending payments we need to if the service was paid or not by screenshot or maybe transaction id
// 4 cards in the dashboard total requests - Waiting for payments - pending - finished
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import api from "@/lib/api";
import toast from "react-hot-toast";
import LoadingScreen from "@/src/components/LoadingScreen";

interface Stats {
  total: number;
  pending: number;
  waiting: number;
  finished: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    waiting: 0,
    finished: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/user/profile");
      setStats(response.data.stats);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-text-primary ">
          Dashboard
        </h1>
        <p className="text-text-secondry">
          Welcome back! Here's your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Requests"
          value={stats.total}
          icon="/form.svg"
          alt={"form"}
        />
        <DashboardCard
          title="Waiting Confirmation"
          value={stats.waiting}
          icon="/watch.svg"
          alt={"form"}
        />
        <DashboardCard
          title="Pending"
          value={stats.pending}
          icon="/pending.svg"
          alt={"form"}
        />
        <DashboardCard
          title="Finished"
          value={stats.finished}
          icon="/check.svg"
          alt={"form"}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-background-secondry border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/submit-request"
            className="p-4 bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg hover:scale-105 transition-transform"
          >
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold mb-1">Submit New Request</h3>
            <p className="text-sm text-text-secondry">
              Create a new data request
            </p>
          </a>
          <a
            href="/dashboard/history"
            className="p-4 bg-linear-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-lg hover:scale-105 transition-transform"
          >
            <div className="text-3xl mb-2">📜</div>
            <h3 className="font-semibold mb-1">View History</h3>
            <p className="text-sm text-text-secondry">
              Check your past requests
            </p>
          </a>
          <a
            href="/dashboard/notifications"
            className="p-4 bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg hover:scale-105 transition-transform"
          >
            <div className="text-3xl mb-2">🔔</div>
            <h3 className="font-semibold mb-1">Notifications</h3>
            <p className="text-sm text-text-secondry">
              View your notifications
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
