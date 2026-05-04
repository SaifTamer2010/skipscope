"use client";

import React from "react";

const FullScreenLoading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground">
      <div className="relative">
        {/* Premium Spinner */}
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        <div className="absolute inset-0 h-24 w-24 rounded-full border-r-4 border-l-4 border-primary/30 animate-pulse"></div>
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="mt-8 flex flex-col items-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tighter animate-pulse">SkipScope</h2>
        <p className="text-sm text-muted-foreground animate-bounce">Initializing session...</p>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default FullScreenLoading;
