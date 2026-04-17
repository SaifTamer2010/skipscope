"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Kanban,
  Database,
  ShieldCheck,
  Settings
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, List as ListIcon, History, ShieldAlert } from "lucide-react";

const AdminSidebar = ({ isOpen }: { isOpen: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsSuperAdmin(!!user.isSuperAdmin);
      } catch (e) {
        console.error("Error parsing admin_user", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
    toast.success("Logged out successfully");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/app/dashboard" },
    { 
      name: "Requests", 
      icon: Kanban, 
      isAccordion: true,
      subItems: [
        { name: "List", icon: ListIcon, path: "/admin/app/requests/list" },
        { name: "Board", icon: Kanban, path: "/admin/app/kanban" },
        { name: "Timeline", icon: History, path: "/admin/app/requests/timeline" }
      ]
    },
    { name: "Users", icon: Users, path: "/admin/app/users" },
    { name: "Providers", icon: Database, path: "/admin/app/providers" },
  ];

  if (isSuperAdmin) {
    menuItems.push({ name: "Manage Admins", icon: ShieldAlert, path: "/admin/app/manage-admins" });
  }

  menuItems.push({ name: "Settings", icon: Settings, path: "/admin/app/settings" });


  return (
    <div
      className={cn(
        "relative flex flex-col h-screen bg-white border-r border-gray-100 shadow-sm z-50 transition-[margin] ease-in-out duration-300 overflow-hidden shrink-0",
        isOpen ? "ml-0" : "-ml-[260px]"
      )}
    >
      <div className="w-[260px] h-full flex flex-col">
        {/* Header / Logo */}
        <div className="h-20 flex items-center px-6 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" className="w-7 h-7 text-black fill-current absolute top-1"><path d="M1.635 29.658h4.674c.806 10.684 9.372 19.273 20.033 20.079v4.605c0 .921.714 1.658 1.635 1.658c.944 0 1.658-.737 1.658-1.658v-4.605c10.661-.806 19.227-9.395 20.033-20.08h4.674A1.65 1.65 0 0 0 56 28c0-.921-.737-1.635-1.658-1.635h-4.674c-.806-10.684-9.372-19.273-20.033-20.079V1.658C29.635.737 28.92 0 27.977 0c-.921 0-1.635.737-1.635 1.658v4.628c-10.661.806-19.227 9.395-20.033 20.08H1.635C.714 26.365.1 27.078.1 28s.614 1.658 1.535 1.658m26.342-10.753c.944 0 1.658-.737 1.658-1.658V10.04c8.658.782 15.381 7.575 16.142 16.325h-7.024c-.92 0-1.658.714-1.658 1.635s.737 1.658 1.658 1.658h7.024c-.76 8.727-7.484 15.52-16.142 16.303v-7.208c0-.92-.714-1.635-1.658-1.635c-.921 0-1.635.714-1.635 1.635v7.208c-8.658-.783-15.381-7.576-16.141-16.303h7.023c.92 0 1.658-.737 1.658-1.658s-.737-1.635-1.658-1.635H10.2c.76-8.75 7.483-15.543 16.141-16.325v7.207c0 .92.714 1.658 1.635 1.658" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tighter text-black whitespace-nowrap">
              adminpanel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            if (item.isAccordion) {
              const isAnyChildActive = item.subItems?.some(sub => pathname === sub.path);
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <button
                    onClick={() => setRequestsOpen(!requestsOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                      isAnyChildActive || requestsOpen
                        ? "bg-gray-50 text-black"
                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className={cn("flex-shrink-0", (isAnyChildActive || requestsOpen) ? "text-black" : "text-gray-500")} />
                      <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                    {requestsOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                  </button>
                  
                  {requestsOpen && (
                    <div className="flex flex-col gap-1 pl-11 pr-2 mt-1">
                      {item.subItems?.map((sub) => {
                        const isChildActive = pathname === sub.path;
                        return (
                          <button
                            key={sub.name}
                            onClick={() => router.push(sub.path)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                              isChildActive
                                ? "bg-black text-white"
                                : "text-gray-500 hover:bg-gray-50 hover:text-black"
                            )}
                          >
                            <sub.icon size={16} className={cn("flex-shrink-0", isChildActive ? "text-white" : "text-gray-500")} />
                            <span className="text-xs font-bold tracking-tight whitespace-nowrap uppercase">
                              {sub.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path!)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                <item.icon size={20} className={cn("flex-shrink-0", isActive ? "text-white" : "text-gray-500")} />
                <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="px-4 pb-8 space-y-2 shrink-0">
          <div className="h-[1px] bg-gray-100 mx-2 mb-4" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
              Logout
            </span>
          </button>

          <div className="mt-4 px-4">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">
              <ShieldCheck size={12} />
              <span>Admin Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
