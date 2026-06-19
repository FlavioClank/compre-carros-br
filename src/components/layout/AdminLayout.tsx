import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { usePendingBillings } from "@/hooks/usePendingBillings";
import {
  Car,
  LayoutDashboard,
  Building2,
  Package,
  History,
  FileText,
  LogOut,
  Menu,
  X,
  Tags,
  Megaphone,
  BarChart3,
  Bell,
  CreditCard,
  Wallet,
  Globe,
  Handshake,
  MessageCircle,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Building2, label: "Garagens", href: "/admin/garages" },
  { icon: Package, label: "Veículos", href: "/admin/cars" },
  { icon: Tags, label: "Marcas", href: "/admin/brands" },
  { icon: Megaphone, label: "Anúncios", href: "/admin/ads" },
  { icon: Megaphone, label: "Banners", href: "/admin/banners" },
  { icon: CreditCard, label: "Planilha", href: "/admin/planilha" },
  { icon: Wallet, label: "Gastos", href: "/admin/gastos" },
  { icon: BarChart3, label: "Estatísticas", href: "/admin/stats" },
  { icon: History, label: "Histórico", href: "/admin/history" },
  { icon: Handshake, label: "Consórcio", href: "/admin/consortium" },
  
  { icon: FileText, label: "Logs", href: "/admin/logs" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pendingCount } = usePendingBillings();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Pending Billings Notification */}
      {pendingCount > 0 && (
        <Link
          to="/admin/planilha"
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium hover:bg-destructive/90 transition-colors lg:left-64"
        >
          <Bell className="h-4 w-4" />
          <span>
            Notificação: {pendingCount} recebimento{pendingCount > 1 ? "s" : ""} pendente{pendingCount > 1 ? "s" : ""}. Atualize sua planilha.
          </span>
        </Link>
      )}
      {/* Mobile Header */}
      <header className={`lg:hidden sticky z-40 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 ${pendingCount > 0 ? "top-9" : "top-0"}`}>
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Car className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-sidebar-foreground">
            {SITE_NAME}
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-sidebar-foreground block">
                {SITE_NAME}
              </span>
              <span className="text-xs text-sidebar-foreground/60">Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {/* Voltar ao Site */}
            <Link
              to="/"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-4 border border-sidebar-border"
            >
              <Globe className="h-5 w-5" />
              Voltar ao Site
            </Link>

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-semibold text-sidebar-accent-foreground">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Super Admin
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`lg:pl-64 min-h-screen ${pendingCount > 0 ? "pt-9" : ""}`}>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
