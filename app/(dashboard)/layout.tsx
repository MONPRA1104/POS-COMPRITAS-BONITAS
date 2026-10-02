import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getAuthSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  
  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-cream overscroll-none">
      {/* Sidebar: fixed height, never scrolls with content */}
      <Sidebar userPermissions={session?.user} />

      {/* Main Content Area: fills remaining width, scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden pb-16 lg:pb-0">
        {/* Header: sticky at the top of this column */}
        <Header />
        {/* Scrollable page content */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Navigation bar for Mobile */}
      <MobileNav />
    </div>
  );
}
