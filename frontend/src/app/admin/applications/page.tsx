"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { CreditApplication } from "@/types";

const labels: Record<string, string> = { pending: "En attente", under_review: "En révision", scoring_done: "Scoré", matched: "Matché", contract_proposed: "Proposé", active: "Actif", rejected: "Refusé" };

export default function ApplicationsPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<(CreditApplication & { student_profiles?: any })[]>([]);

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
    if (profile?.role === "student") router.push("/dashboard");
    if (profile?.role === "company") router.push("/company/dashboard");
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/admin/applications").then((r: any) => setApps(r.data || [])).catch(() => {});
  }, [profile]);

  if (loading || !profile) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dossiers étudiants</h1>
      <Card>
        <CardHeader><CardTitle>Tous les dossiers</CardTitle></CardHeader>
        <CardContent>
          {apps.length === 0 ? <p className="text-sm text-muted-foreground">Aucun dossier</p> : (
            <div className="space-y-3">{apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{app.student_profiles?.profiles?.full_name || "Étudiant"}</p>
                  <p className="text-sm text-muted-foreground">{app.requested_monthly_amount.toLocaleString()} MAD/mois · {app.requested_duration_months} mois{app.ai_score && ` · Score: ${app.ai_score}/100`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{labels[app.status] || app.status}</Badge>
                  <Button asChild size="sm" variant="outline"><Link href={`/admin/applications/${app.id}`}>Détail</Link></Button>
                </div>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
