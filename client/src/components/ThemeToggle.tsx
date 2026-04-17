"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") || "light";
    setTheme(savedTheme);
    
    // Ensure html element has correct classes
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  if (!mounted) return <div className="w-14 h-7" />; // Prevent hydration mismatch

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Update html element
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };


  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className={`
        relative w-14 h-7 bg-background-main/50 border border-border-muted rounded-full 
        transition-all duration-300 hover:border-brand-primary/50 shadow-inner shadow-black/20
        ${theme === "dark" ? "border-brand-primary/30" : ""}
      `}
    >
      {/* Icon Track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-text-secondry/30">
        <Sun size={12} />
        <Moon size={12} />
      </div>

      {/* Slider Handle */}
      <div
        className={`
          absolute top-[3.5px] left-[3.5px] w-[21px] h-[21px] rounded-full 
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          flex items-center justify-center shadow-lg
          ${theme === "dark" 
            ? "translate-x-7 bg-brand-primary shadow-brand-primary/40 ring-4 ring-brand-primary/10" 
            : "translate-x-0 bg-text-secondry shadow-black/20"}
        `}
      >
        {theme === "dark" ? (
          <Moon size={10} className="text-white fill-white" />
        ) : (
          <Sun size={10} className="text-white fill-current" />
        )}
      </div>
    </button>
  );
}
