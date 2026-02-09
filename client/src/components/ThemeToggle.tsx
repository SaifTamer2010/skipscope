"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 bg-background-third border border-white/10 rounded-full transition-colors hover:border-purple-500/50"
    >
      <div
        className={`
          absolute top-1 w-6 h-6 bg-linear-to-r from-purple-500 to-pink-500 rounded-full
          transition-all duration-300 ease-in-out
          ${theme === "dark" ? "left-1" : "left-9"}
        `}
      >
        <span className="flex items-center justify-center h-full text-xs">
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </div>
    </button>
  );
}
