import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shell } from "@/components/shared/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { FileText, Clock, CheckCircle2, FileCheck, Building2, TrendingUp, Shield } from "lucide-react";

interface KPI { total_applications: number; pending_review: number; scored: number; active_contracts: number; total_companies: number; total_invested: number; }

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (profile?.role === "student") navigate("/dashboard");
    if (profile?.role === "company") navigate("/company/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/admin/dashboard").then((r: any) => setKpi(r.data)).catch(() => {}).finally(() => setFetching(false));
  }, [profile]);

  if (loading || !profile) return null;

  const cards = [
    { icon: FileText, title: "Total dossiers", value: kpi?.total_applications || 0, color: "", bg: "bg-blue-500/10", iconColor: "text-blue-600" },
    { icon: Clock, title: "En attente", value: kpi?.pending_review || 0, color: "text-yellow-600", bg: "bg-yellow-500/10", iconColor: "text-yellow-600" },
    { icon: CheckCircle2, title: "Scorés", value: kpi?.scored || 0, color: "text-green-600", bg: "bg-green-500/10", iconColor: "text-green-600" },
    { icon: FileCheck, title: "Contrats actifs", value: kpi?.active_contracts || 0, color: "", bg: "bg-purple-500/10", iconColor: "text-purple-600" },
    { icon: Building2, title: "Entreprises", value: kpi?.total_companies || 0, color: "", bg: "bg-orange-500/10", iconColor: "text-orange-600" },
    { icon: TrendingUp, title: "Total investi", value: kpi ? `${kpi.total_invested.toLocaleString()} MAD` : "0 MAD", color: "text-secondary", bg: "bg-secondary/10", iconColor: "text-secondary" },
  ];

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">Pilotez la plateforme Jisser</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {fetching ? (
                    <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  ) : (
                    <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
