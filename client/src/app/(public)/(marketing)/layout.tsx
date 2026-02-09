import MarketingNavbar from "@/src/components/layouts/MarketingNavbar";
import "../../globals.css";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>
        <div className="h-screen grid-rows-[auto_1fr]">
          <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
          <MarketingNavbar />
          {children}
        </div>
      </main>
    </>
  );
}
