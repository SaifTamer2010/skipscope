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
        className="w-40 sm:w-38  h-12 rounded-xl bg-background-third shadow-black shadow-md p-2 cursor-pointer hover:scale-115 transition-all text-text-primary"
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
