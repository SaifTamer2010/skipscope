"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import Logo from "@/components/ui/logo/logo";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Send,
  Bell,
  History,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  {
    name: "Dashboard",
    path: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Submit a Request",
    path: "/app/submit-request",
    icon: Send,
  },
  {
    name: "Notifications",
    path: "/app/notifications",
    icon: Bell,
  },
  {
    name: "History",
    path: "/app/history",
    icon: History,
  },
  {
    name: "Settings",
    path: "/app/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useUserStore((state) => state.logout);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
    } else {
      logout();
      router.push("/app/auth/login");
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background-secondry rounded-lg border border-white/10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isCollapsed ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-background-main/40 backdrop-blur-xl border-r border-border-light
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-8 pb-4 border-b border-border-light">
            <h1
              className={`text-2xl font-bold text-text-primary text-center ${isCollapsed ? "lg:text-center lg:text-xl" : ""}`}
            >
              {isCollapsed ? "SS" : <Logo />}
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2 flex flex-col items-start gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const showBadge =
                item.name === "Notifications" && unreadCount > 0;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                    ${isActive
                      ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                      : "text-text-secondry hover:bg-background-third border border-transparent hover:border-border-light"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-brand-primary" : "text-text-secondry"}`} />

                  {!isCollapsed && (
                    <div className="flex-1 flex justify-between items-center overflow-hidden">
                      <span className="font-bold uppercase tracking-tight text-sm whitespace-nowrap">{item.name}</span>
                      {showBadge && (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-brand-primary rounded-full text-text-button">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  )}

                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="pt-4 mt-4 border-t border-border-light space-y-2">

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              {!isCollapsed && <span className="font-bold uppercase tracking-tight text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
