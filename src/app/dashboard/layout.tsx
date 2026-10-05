import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import RouteGuard from "@/components/auth/RouteGuard";

/*Function for the dashboard layout */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <RouteGuard>{children}</RouteGuard>
          </main>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}