"use client";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
}: DashboardCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] p-8 border border-border-light bg-background-secondry/40 backdrop-blur-xl shadow-2xl shadow-black/5 transition-all duration-500 hover:scale-[1.02] hover:border-brand-primary/40 group"
    >
      {/* Background Decorative Icon */}
      <div className="absolute top-2 -right-4 w-32 h-32 opacity-[0.03] text-text-primary transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
        <Icon size={120} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
            <Icon size={24} />
          </div>
          <h3 className="text-text-secondry text-xs font-bold uppercase tracking-wider">{title}</h3>
        </div>
        
        <div>
          <p className="text-5xl font-bold text-text-primary tracking-tighter">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend.isPositive ? "text-emerald-500" : "text-rose-500"}`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-text-secondry/60 ml-1 font-medium">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
