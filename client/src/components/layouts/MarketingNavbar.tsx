"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import MainButton from "@/src/components/buttons/MainButton";
import Logo from "../ui/logo/logo";

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

const links = [
  { href: "/", label: "Home" },
  { href: "/industries", label: "Industries" },
  { href: "/how_it_works", label: "How It Works" },
  { href: "/packages", label: "Packages" },
];

const MarketingNavbar = () => {
  const [isSideBar, toggleIsSideBar] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="relative flex h-12 p-6 justify-between mb-10">
        {/* Logo */}
        <Logo />
        {/* Navbar */}
        {/* medium devices navbar */}
        <div className="hidden md:flex justify-between gap-12">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm sm:text-xl font-semibold text-center
              ${isActive ? "text-text-primary" : "text-text-secondry"}
            `}
              >
                {link.label}

                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-8 left-0 right-0 h-0.5 bg-white"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        <div className="hidden md:block">
          <MainButton Goto="/app/auth/login">
            <p className="text-text-primary font-semibold shadow-black text-shadow-2xs text-md">
              Start Building
            </p>
          </MainButton>
        </div>
        {/* mobile devices navbar */}
        <div className="sm:hidden block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" suppressHydrationWarning>
                <Image src={"/menu.svg"} alt={"menu"} height={25} width={25} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <span className="font-medium text-gray-300/80">Menu</span>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push("/")}>
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/industries")}>
                  Industries
                  {/* <DropdownMenuShortcut>Shift + U</DropdownMenuShortcut> */}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/how_it_works")}>
                  How it works
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/packages")}>
                  Packages
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-500/80 mx-2" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/app/auth/login")}
                >
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/app/auth/register")}
                >
                  Sign up
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default MarketingNavbar;
