"use client";

import AdminNavbar from "@/src/components/layouts/AdminNavbar";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isEnrollPage = pathname === "/admin/app/enroll";

  return (
    <div className="grid grid-rows-[auto_1fr]">
      {!isEnrollPage && <AdminNavbar />}
      {children}
    </div>
  );
};

export default Layout;
