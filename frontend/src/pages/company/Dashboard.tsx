import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { CompanyNeed } from "@/types";
import { Shell } from "@/components/shared/app-shell";
import {
  Building2, TrendingUp, Users, Target, ArrowRight, Megaphone,
  UserCheck, BarChart3, CheckCircle, Circle, Plus
} from "lucide-react";

interface ROI {
  total_invested: number;
  active_contracts: number;
  completed_contracts: number;
  estimated_roi: number;
}

const steps = [
  {
    icon: Building2, title: "Crée ton profil entreprise",
    desc: "RC, secteur, ville — pour que les étudiants te trouvent",
    action: { label: "Compléter", to: "/company/profile" },
    check: (cp: any) => cp?.company_name,
  },
  {
    icon: Megaphone, title: "Publie un besoin",
    desc: "Décris le profil, le budget et la durée",
    action: { label: "Publier", to: "/company/needs" },
    check: (_p: any, needs: CompanyNeed[]) => needs.length > 0,
  },
  {
    icon: Users, title: "Reçois des étudiants matchés",
    desc: "Notre IA te propose les meilleurs profils",
    action: null,
    check: (_p: any, _needs: CompanyNeed[], roi: ROI | null) =>
      (roi?.active_contracts ?? 0) > 0 || (roi?.completed_contracts ?? 0) > 0,
    isWaiting: (_p: any, needs: CompanyNeed[]) =>
      needs.some((n) => n.status === "open"),
  },
  {
    icon: UserCheck, title: "Suis tes étudiants",
    desc: "Consulte leurs rapports de stage et semestres",
    action: { label: "Étudiants", to: "/company/assigned-students" },
    check: (_p: any, _needs: CompanyNeed[], roi: ROI | null) =>
      (roi?.active_contracts ?? 0) > 0,
  },
  {
    icon: BarChart3, title: "Mesure ton ROI",
    desc: "Suis l'impact de ton investissement",
    action: { label: "ROI", to: "/company/roi" },
    check: (_p: any, _needs: CompanyNeed[], roi: ROI | null) =>
      (roi?.total_invested ?? 0) > 0,
  },
];

export default function CompanyDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [roi, setRoi] = useState<ROI | null>(null);
  const [needs, setNeeds] = useState<CompanyNeed[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (profile?.role === "student") navigate("/dashboard");
    if (profile?.role === "admin") navigate("/admin/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      api.get("/api/companies/profile").then((r: any) => setCompanyProfile(r.data)).catch(() => {}),
      api.get("/api/companies/roi").then((r: any) => setRoi(r.data)).catch(() => {}),
      api.get("/api/companies/needs").then((r: any) => setNeeds(r.data || [])).catch(() => {}),
    ]).finally(() => setFetching(false));
  }, [profile]);

  if (loading || !profile) return null;

  const needsOpen = needs.filter((n) => n.status === "open").length;

  const currentStepIndex = (() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      const s = steps[i];
      if (s.check(companyProfile, needs, roi)) return i;
    }
    return -1;
  })();

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Bon retour, {profile.full_name.split(" ")[0]} !
            </h1>
            <p className="text-muted-foreground">Pilote tes investissements talents</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {fetching ? (
            <>
              {[1,2,3,4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-8 w-20 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium">Investissement total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {roi ? `${roi.total_invested.toLocaleString()} MAD` : "0 MAD"}
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <CardTitle className="text-sm font-medium">Contrats actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-secondary">{roi?.active_contracts || 0}</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-sm font-medium">Besoins ouverts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600">{needsOpen}</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-medium">ROI estimé</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-600">
                    {roi ? `${roi.estimated_roi.toLocaleString()} MAD` : "—"}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card className="overflow-hidden border-t-2 border-t-secondary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
                <Building2 className="h-4 w-4 text-secondary" />
              </div>
              <CardTitle>Bien démarrer sur Jisser</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Suis ces étapes pour builtir ta stratégie de talents
            </p>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {steps.map((step, i) => {
                    const done = i <= currentStepIndex;
                    const waiting = step.isWaiting?.(profile, needs) ?? false;
                    return (
                      <div key={i} className="relative flex items-start gap-4">
                        <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                          done
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : waiting
                              ? "border-amber-400 bg-amber-50 text-amber-500"
                              : "border-muted-foreground/30 bg-background text-muted-foreground"
                        }`}>
                          {done ? <CheckCircle className="h-4 w-4" /> :
                           <Circle className="h-4 w-4" />}
                        </div>
                        <div className={`flex-1 pb-2 ${done ? "" : "opacity-50"}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                                {step.title}
                              </p>
                              <p className="text-sm text-muted-foreground">{step.desc}</p>
                            </div>
                            {step.action && !done && (
                              <Button asChild size="sm" variant={i === 0 ? "secondary" : "outline"}>
                                <Link to={step.action.to}>
                                  {step.action.label} <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                            {done && step.action && (
                              <Button asChild size="sm" variant="ghost">
                                <Link to={step.action.to}>
                                  Gérer <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10">
                    <Megaphone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Publier un besoin</p>
                    <p className="text-sm text-muted-foreground">Décris le profil que tu recherches</p>
                  </div>
                </div>
                <Button asChild variant="secondary">
                  <Link to="/company/needs">
                    <Plus className="mr-1 h-4 w-4" /> Créer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Étudiants assignés</p>
                    <p className="text-sm text-muted-foreground">
                      {roi?.active_contracts
                        ? `${roi.active_contracts} étudiant${roi.active_contracts > 1 ? "s" : ""} en cours`
                        : "Aucun étudiant pour le moment"}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link to="/company/assigned-students">
                    Voir <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {needs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tes besoins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {needs.slice(0, 5).map((need) => (
                  <div key={need.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{need.title}</p>
                      <p className="text-sm text-muted-foreground">{need.field_of_study}</p>
                    </div>
                    <Badge variant={need.status === "open" ? "outline" : "secondary"}>
                      {need.status === "open" ? "Ouvert" : need.status === "matched" ? "Matché" : "Fermé"}
                    </Badge>
                  </div>
                ))}
                {needs.length > 5 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/company/needs">Voir tout ({needs.length})</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
