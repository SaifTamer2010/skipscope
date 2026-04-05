import MarketingNavbar from "@/src/components/layouts/MarketingNavbar";
import "../../globals.css";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>
        {/* <div className="min-h-screen grid-rows-1"> */}
        <MarketingNavbar />
        {children}
        {/* </div> */}
      </main>
    </>
  );
}
