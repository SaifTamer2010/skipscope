"use client";
import Image from "next/image";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: string;

  trend?: {
    value: number;
    isPositive: boolean;
  };
  alt: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  alt,
}: DashboardCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-6 shadow-xl shadow-black
        transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-background-secondry
       
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-2 -right-4 w-32 h-32 opacity-10">
        <Image src={icon} height={100} width={100} alt={alt} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <Image src={icon} height={35} width={35} alt={alt} className="" />
          <h3 className="text-text-primary text-md font-bold">{title}</h3>
        </div>
        <p className="text-4xl font-bold mb-2 ">{value}</p>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${trend.isPositive ? "text-green-400" : "text-red-400"}`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-text-secondry">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
