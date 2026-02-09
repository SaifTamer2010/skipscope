"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import MainButton from "@/src/components/buttons/MainButton";
import Logo from "../ui/logo/logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/industries", label: "Industries" },
  { href: "/how_it_works", label: "How It Works" },
  { href: "/packages", label: "Packages" },
];

const MarketingNavbar = () => {
  const [isSideBar, toggleIsSideBar] = useState(false);
  const pathname = usePathname();

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
        <button
          className="flex md:hidden w-8 h-8 shadow-2xs shadow-black bg-background-third items-center justify-center rounded-xs"
          onClick={() => {
            toggleIsSideBar(!isSideBar);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M3 18v-2h18v2zm0-5v-2h18v2zm0-5V6h18v2z"
            />
          </svg>
        </button>
        {isSideBar && (
          <div
            className="absolute w-fll h-screen bg-black/50  left-0 right-0 top-0 bottom-0"
            onClick={() => {
              toggleIsSideBar(false);
            }}
          >
            <aside
              className="absolute right-15 top-15 bg-background-third w-50 z-55 h-55 p-4 flex gap-6 flex-col justify-center  shadow-2xs shadow-black rounded-tl-xl rounded-b-xl"
              // onClick={(e) => {
              //   e.stopPropagation();
              // }}
            >
              <Link
                href={"/"}
                className={`text-sm sm:text-xl font-semibold cursor-pointer text-center 
              ${pathname == "/" ? "text-text-primary" : " text-text-secondry"}`}
              >
                Home
              </Link>
              <Link
                href={"/industries"}
                className={`text-sm sm:text-xl font-semibold cursor-pointer text-center 
              ${pathname == "/industries" ? "text-text-primary" : " text-text-secondry"}`}
              >
                Industries
              </Link>
              <Link
                href={"/"}
                className={`text-sm sm:text-xl font-semibold cursor-pointer text-center 
              ${pathname == "/" ? "text-text-primary" : " text-text-secondry"}`}
              >
                How It Works
              </Link>
              <Link
                href={"/"}
                className={`text-sm sm:text-xl font-semibold cursor-pointer text-center 
              ${pathname == "/" ? "text-text-primary" : " text-text-secondry"}`}
              >
                Packages
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketingNavbar;
