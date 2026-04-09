import React from "react";

const authContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background-secondry w-110 h-160 rounded-2xl border border-white/5 shadow-2xl shadow-black p-20 flex justify-center items-center flex-col gap-12">
      {children}
    </div>
  );
};

export default authContainer;
