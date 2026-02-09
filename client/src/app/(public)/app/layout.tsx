"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { useUserStore } from "@/store/userStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // Check if current route is an auth route
  const isAuthRoute = pathname?.startsWith("/app/auth");

  useEffect(() => {
    if (!isAuthenticated && !isAuthRoute) {
      router.push("/app/auth/login");
    }
  }, [isAuthenticated, router, isAuthRoute]);

  // If not authenticated and not on auth route, redirect (but don't block render)
  if (!isAuthenticated && !isAuthRoute) {
    return null;
  }

  // For auth routes, don't show sidebar
  if (isAuthRoute) {
    return (
      <>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0d0d0d",
              color: "#f2f2f2",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#f2f2f2",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f2f2f2",
              },
            },
          }}
        />
      </>
    );
  }

  // For authenticated routes, show sidebar
  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12">{children}</main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0d0d0d",
            color: "#f2f2f2",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#f2f2f2",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#f2f2f2",
            },
          },
        }}
      />
    </div>
  );
}
