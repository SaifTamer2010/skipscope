import AdminNavbar from "@/src/components/layouts/AdminNavbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-rows-[auto_1fr]">
      <AdminNavbar />
      {children}
    </div>
  );
};

export default layout;
