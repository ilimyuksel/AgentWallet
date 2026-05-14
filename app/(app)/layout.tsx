import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f6f8fa]">
      <Sidebar />
      <main className="ml-56 flex-1 min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
