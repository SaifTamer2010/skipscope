"use client";

import AdminSidebar from "@/src/components/layouts/AdminSidebar";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isEnrollPage = pathname === "/admin/app/enroll";

  if (isEnrollPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-white">
        {children}
      </main>
    </div>
  );
};

export default Layout;
