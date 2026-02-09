import React from "react";

const authContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background-secondry w-110 h-150 rounded-xl shadow-2xl shadow-grey p-20 flex justify-center items-center flex-col gap-12">
      {children}
    </div>
  );
};

export default authContainer;
