import React from "react";

const authContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background-secondry/80 backdrop-blur-3xl w-110 h-160 rounded-[3rem] border border-border-light shadow-2xl shadow-black p-20 flex justify-center items-center flex-col gap-12">
      {children}
    </div>
  );
};

export default authContainer;
