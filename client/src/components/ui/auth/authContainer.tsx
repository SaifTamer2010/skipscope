import React from "react";

const authContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background-secondry/80 backdrop-blur-3xl w-[440px] min-h-[640px] h-auto rounded-[3rem] border border-border-light shadow-2xl shadow-black p-10 py-14 flex justify-center items-center flex-col gap-8 transition-all duration-300">
      {children}
    </div>
  );
};

export default authContainer;
