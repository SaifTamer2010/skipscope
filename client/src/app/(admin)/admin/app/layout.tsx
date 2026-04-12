"use client";

import { useState } from "react";
import AdminSidebar from "@/src/components/layouts/AdminSidebar";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isEnrollPage = pathname === "/admin/app/enroll";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isEnrollPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-16 border-b border-gray-100 flex items-center px-4 shrink-0 bg-white">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-50 rounded-lg text-black transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
