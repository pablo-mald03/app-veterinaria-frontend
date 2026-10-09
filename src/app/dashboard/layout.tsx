import { SidebarProvider } from "@/components/layout/SidebarContext";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import SidebarMobile from "@/components/layout/SidebarMobile";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import RouteGuard from "@/components/auth/RouteGuard";

/*Function for the dashboard layout */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <SidebarMobile />
          <div className="flex flex-1">
            <Sidebar />
            <main className="min-w-0 flex-1">
              <RouteGuard>{children}</RouteGuard>
            </main>
          </div>
          <Footer />
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}