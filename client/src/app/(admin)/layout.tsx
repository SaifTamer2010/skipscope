import type { Metadata } from "next";
import "./globals.css";

import AdminAuthProvider from "@/components/AdminAuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SkipScope",
  description: "scoop the data you need we will skip it for you (wink wink)",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </div>
  );
}
