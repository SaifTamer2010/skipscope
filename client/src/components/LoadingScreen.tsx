const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-background-main/5 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className="absolute h-24 w-24 rounded-full border border-brand-primary/20 blur-xl animate-pulse"></div>
        
        {/* Main Spinner Ring */}
        <div className="h-16 w-16 rounded-full border-t-2 border-r-2 border-brand-primary animate-spin shadow-[0_0_15px_rgba(18,130,146,0.3)]"></div>
        
        {/* Inner Core */}
        <div className="absolute h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_10px_var(--color-brand-primary)]"></div>
        
        {/* Scan Line effect wrapper */}
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-20">
          <div className="h-full w-full bg-linear-to-b from-brand-primary to-transparent animate-scan"></div>
        </div>
      </div>
      
      {/* Brand Signature */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em] opacity-40 animate-pulse">
          SkipScope Intelligence
        </span>
        <div className="h-[1px] w-8 bg-brand-primary/30"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
