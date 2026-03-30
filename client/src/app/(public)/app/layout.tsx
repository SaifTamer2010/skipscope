"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import { useUserStore } from "@/store/userStore";
import AuthProvider from "@/src/components/AuthProvider";
import NotificationToastProvider from "@/components/NotificationToastProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  // Check if current route is an auth route
  const isAuthRoute = pathname?.startsWith("/app/auth"); //true if no authenticated

  return (
    <AuthProvider>
      <NotificationToastProvider />
      <div
        className={`bg-background-main ${!isAuthRoute && "grid grid-cols-[auto_1fr]"} `}
      >
        {!isAuthRoute && <Sidebar />}
        <div className="p-6">{children}</div>
      </div>
    </AuthProvider>
  );
}
