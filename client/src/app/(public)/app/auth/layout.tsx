import MarketingNavbar from "@/src/components/layouts/MarketingNavbar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>
        <div className="bg-background-main absolute w-screen h-full top-0 left-0 -z-10"></div>
        {children}
      </main>
    </>
  );
}
