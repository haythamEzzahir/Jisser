"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

interface RoiData { total_invested: number; active_contracts: number; completed_contracts: number; estimated_roi: number; }

export default function RoiPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [roi, setRoi] = useState<RoiData | null>(null);

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/companies/roi").then((r: any) => setRoi(r.data)).catch(() => {});
  }, [profile]);

  if (loading || !profile) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Retour sur investissement</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total investi</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{roi ? `${roi.total_invested.toLocaleString()} MAD` : "—"}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">ROI estimé</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{roi ? `${roi.estimated_roi.toLocaleString()} MAD` : "—"}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Contrats actifs</span><span className="font-medium">{roi?.active_contracts || 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Contrats terminés</span><span className="font-medium">{roi?.completed_contracts || 0}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
