"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
const MainButton = ({
  children,
  Goto,
}: {
  children: ReactNode;
  Goto: string;
}) => {
  return (
    <>
      <button
        className="w-40 sm:w-38 h-12 rounded-xl bg-brand-red-strong shadow-black shadow-md p-2 cursor-pointer hover:scale-105 active:scale-95 transition-all text-text-primary font-bold italic uppercase tracking-widest text-[10px]"
        onClick={() => {
          redirect(Goto);
        }}
      >
        {children}
      </button>
    </>
  );
};

export default MainButton;
