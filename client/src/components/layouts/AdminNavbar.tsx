"use client";

import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AdminNavbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="h-[80px] w-[98.8vw] border-b border-gray-800 bg-black backdrop-blur-sm sticky top-0 z-10 ">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* shadcn dropdown button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" suppressHydrationWarning>
                  <Image
                    src={"/menu.svg"}
                    alt={"menu"}
                    height={25}
                    width={25}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Menu</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/app/dashboard")}
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/app/kanban")}
                  >
                    Board
                    {/* <DropdownMenuShortcut>Shift + U</DropdownMenuShortcut> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/app/users")}
                  >
                    Users
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/app/providers")}
                  >
                    Providers
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
