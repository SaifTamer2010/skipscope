"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { motion } from "framer-motion";
import Image from "next/image";

import Logo from "@/components/ui/logo/logo";
import { supabase } from "@/lib/supabase";

const menuItems = [
  {
    name: "Dashboard",
    path: "/app/dashboard",
    icon: "/dashboard.svg",
    alt: "Dashboard",
  },
  {
    name: "Submit a Request",
    path: "/app/submit-request",
    icon: "/form.svg",
    alt: "submit a request",
  },
  {
    name: "Notifications",
    path: "/app/notifications",
    icon: "/notifications.svg",
    alt: "Notifications",
  },
  {
    name: "History",
    path: "/app/history",
    icon: "/history.svg",
    alt: "History",
  },
  {
    name: "Settings",
    path: "/app/settings",
    icon: "/settings.svg",
    alt: "Settings",
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
          fixed lg:sticky top-0 left-0 h-screen bg-background-secondry border-r border-white/10
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-8 pb-4 border-b border-white/10">
            <h1
              className={`text-2xl font-bold text-text-primary text-center ${isCollapsed ? "lg:text-center lg:text-xl" : ""}`}
            >
              {isCollapsed ? "SS" : <Logo />}
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2 flex flex-col items-start gap-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const showBadge =
                item.name === "Notifications" && unreadCount > 0;

              return (
                <div key={item.name}>
                  <section className="inline-flex gap-4">
                    <Image
                      key={item.name}
                      src={item.icon}
                      alt={item.alt}
                      height={25}
                      width={25}
                      className="mb-1"
                    />
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`relative text-sm sm:text-xl font-semibold text-center
              ${isActive ? "text-text-primary" : "text-text-secondry"}
            `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {showBadge && (
                            <span className="px-3 py-1 text-xs font-extrabold text-center bg-red-500 rounded-full ml-2 text-text-primary">
                              {unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </section>
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/50 transition-all duration-200 text-red-500"
          >
            <Image
              src={"/logout.svg"}
              height={25}
              width={25}
              alt={"Logout"}
              className="mt-0.5"
            />
            {!isCollapsed && <span className="font-semibold">Logout</span>}
          </button>
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
