"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Kanban,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
    toast.success("Logged out successfully");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/app/dashboard" },
    { name: "Board", icon: Kanban, path: "/admin/app/kanban" },
    { name: "Users", icon: Users, path: "/admin/app/users" },
    { name: "Providers", icon: Database, path: "/admin/app/providers" },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="relative flex flex-col h-screen bg-white border-r border-gray-100 shadow-sm z-50 transition-all duration-300"
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" className="w-7 h-7 text-black fill-current absolute top-1"><path d="M1.635 29.658h4.674c.806 10.684 9.372 19.273 20.033 20.079v4.605c0 .921.714 1.658 1.635 1.658c.944 0 1.658-.737 1.658-1.658v-4.605c10.661-.806 19.227-9.395 20.033-20.08h4.674A1.65 1.65 0 0 0 56 28c0-.921-.737-1.635-1.658-1.635h-4.674c-.806-10.684-9.372-19.273-20.033-20.079V1.658C29.635.737 28.92 0 27.977 0c-.921 0-1.635.737-1.635 1.658v4.628c-10.661.806-19.227 9.395-20.033 20.08H1.635C.714 26.365.1 27.078.1 28s.614 1.658 1.535 1.658m26.342-10.753c.944 0 1.658-.737 1.658-1.658V10.04c8.658.782 15.381 7.575 16.142 16.325h-7.024c-.92 0-1.658.714-1.658 1.635s.737 1.658 1.658 1.658h7.024c-.76 8.727-7.484 15.52-16.142 16.303v-7.208c0-.92-.714-1.635-1.658-1.635c-.921 0-1.635.714-1.635 1.635v7.208c-8.658-.783-15.381-7.576-16.141-16.303h7.023c.92 0 1.658-.737 1.658-1.658s-.737-1.635-1.658-1.635H10.2c.76-8.75 7.483-15.543 16.141-16.325v7.207c0 .92.714 1.658 1.635 1.658" /></svg>          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold tracking-tighter text-black whitespace-nowrap overflow-hidden"
              >
                adminpanel
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-zinc-800 transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative",
                isActive
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <item.icon size={20} className={cn("flex-shrink-0", isActive ? "text-white" : "group-hover:text-black")} />
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-4 pb-8 space-y-2">
        <div className="h-[1px] bg-gray-100 mx-2 mb-4" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group relative"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              Logout
            </div>
          )}
        </button>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="px-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">
                <ShieldCheck size={12} />
                <span>Admin Secure</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
