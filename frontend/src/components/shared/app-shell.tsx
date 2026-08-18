import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/shared/loading";
import {
  LayoutDashboard, FileText, FolderOpen, FileCheck, BarChart3,
  Users, TrendingUp, Briefcase, Handshake, Building2,
  LogOut, User, ChevronRight
} from "lucide-react";
import logo from "/logo.png";

const iconMap: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/credit-request": FileText,
  "/documents": FolderOpen,
  "/contract": FileCheck,
  "/tracking": BarChart3,
  "/company/profile": Building2,
  "/company/dashboard": LayoutDashboard,
  "/company/needs": Briefcase,
  "/company/assigned-students": Users,
  "/company/roi": TrendingUp,
  "/admin/dashboard": LayoutDashboard,
  "/admin/applications": FileText,
  "/admin/matching": Handshake,
  "/admin/contracts": FileCheck,
  "/admin/payments": BarChart3,
};

const roleLinks: Record<string, { label: string; href: string }[]> = {
  student: [
    { label: "Tableau de bord", href: "/dashboard" },
    { label: "Demande de crédit", href: "/credit-request" },
    { label: "Documents", href: "/documents" },
    { label: "Contrat", href: "/contract" },
    { label: "Suivi", href: "/tracking" },
  ],
  company: [
    { label: "Tableau de bord", href: "/company/dashboard" },
    { label: "Besoins", href: "/company/needs" },
    { label: "Étudiants", href: "/company/assigned-students" },
    { label: "ROI", href: "/company/roi" },
  ],
  admin: [
    { label: "Tableau de bord", href: "/admin/dashboard" },
    { label: "Dossiers", href: "/admin/applications" },
    { label: "Matching", href: "/admin/matching" },
    { label: "Contrats", href: "/admin/contracts" },
    { label: "Paiements", href: "/admin/payments" },
  ],
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { profile, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const isPublic = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");

  if (loading) return <LoadingScreen />;
  if (isPublic) return <>{children}</>;

  const links = profile ? roleLinks[profile.role] || [] : [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="fixed top-0 z-50 flex h-14 w-full items-center border-b bg-background/80 backdrop-blur-lg">
        <div className="flex w-64 items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Jisser" className="h-7 w-7" />
            <span className="font-heading text-base font-bold tracking-tight">Jisser</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 px-4">
          {profile && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden text-sm font-medium md:block">{profile.full_name}</span>
              <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 pt-14">
        {profile && (
          <aside className="fixed bottom-0 left-0 top-14 z-40 flex w-64 flex-col border-r bg-card">
            <div className="flex-1 overflow-y-auto p-3">
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const Icon = iconMap[link.href] || ChevronRight;
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{link.label}</span>
                      {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-t p-3">
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {profile?.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-medium truncate">{profile?.full_name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{profile?.role}</p>
                </div>
              </div>
            </div>
          </aside>
        )}
        <main className={`flex-1 ${profile ? "ml-64" : ""} p-6`}>
          <div className="animate-fade-in mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
