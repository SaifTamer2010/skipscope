"use client";

// we are going to remove the wiating confirmation with pending payments we need to if the service was paid or not by screenshot or maybe transaction id
// 4 cards in the dashboard total requests - Waiting for payments - pending - finished
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import api from "@/lib/api";
import toast from "react-hot-toast";
import LoadingScreen from "@/src/components/LoadingScreen";
import { 
  Activity, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  PlusCircle, 
  History, 
  Bell,
  ArrowRight
} from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  if (!mounted) return null;


  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-text-primary uppercase tracking-tight">
          Account Dashboard
        </h1>
        <p className="text-text-secondry font-medium">
          Welcome back. Here is a summary of your recent request activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Requests"
          value={stats.total}
          icon={Activity}
        />
        <DashboardCard
          title="Pending Confirmation"
          value={stats.waiting}
          icon={Clock}
        />
        <DashboardCard
          title="In Progress"
          value={stats.pending}
          icon={RotateCcw}
        />
        <DashboardCard
          title="Completed"
          value={stats.finished}
          icon={CheckCircle2}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text-primary uppercase tracking-wider flex items-center gap-3">
          <span className="w-8 h-[1px] bg-brand-primary"></span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Submit New Request",
              desc: "Create a new lead generation request",
              icon: PlusCircle,
              path: "/app/submit-request",
              color: "brand-primary"
            },
            {
              title: "Request History",
              desc: "View and management your past requests",
              icon: History,
              path: "/app/history",
              color: "text-text-secondry"
            },
            {
              title: "Recent Notifications",
              desc: "Stay updated on your request status",
              icon: Bell,
              path: "/app/notifications",
              color: "text-text-secondry"
            }
          ].map((action, i) => (
            <a
              key={i}
              href={action.path}
              className="group relative p-8 bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:border-brand-primary/40 overflow-hidden"
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6 text-brand-primary group-hover:bg-brand-primary group-hover:text-text-button transition-all duration-500 shadow-lg shadow-brand-primary/10`}>
                  <action.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-primary uppercase tracking-tight mb-2 flex items-center gap-2">
                  {action.title}
                  <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-text-secondry/80 font-medium leading-relaxed">
                  {action.desc}
                </p>
              </div>

              {/* Decorative side accent */}
              <div className="absolute top-0 right-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
