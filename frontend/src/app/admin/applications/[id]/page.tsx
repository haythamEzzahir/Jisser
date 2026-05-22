"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { CreditApplication, Document } from "@/types";
import { toast } from "sonner";

interface Detail extends CreditApplication {
  documents: Document[];
  student_profiles: { profiles: { full_name: string; email: string }; school_name: string; field_of_study: string; gpa: number };
}

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [app, setApp] = useState<Detail | null>(null);
  const [loading_action, setLoadingAction] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile || !id) return;
    api.get(`/api/admin/applications/${id}`).then((r: any) => { setApp(r.data); setNotes(r.data.admin_notes || ""); }).catch(() => router.push("/admin/applications"));
  }, [profile, id, router]);

  const act = async (action: "score" | "approve" | "reject") => {
    setLoadingAction(true);
    try {
      if (action === "score") await api.post(`/api/admin/applications/${id}/score`);
      else if (action === "approve") await api.post(`/api/admin/applications/${id}/approve`);
      else await api.post(`/api/admin/applications/${id}/reject?reason=`);
      const r = await api.get<any>(`/api/admin/applications/${id}`);
      setApp(r.data);
      } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erreur"); }
    finally { setLoadingAction(false); }
  };

  const saveNotes = async () => { await api.put(`/api/admin/applications/${id}/notes?notes=${encodeURIComponent(notes)}`); toast.success("Notes sauvegardées"); };

  if (loading || !app) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{app.student_profiles?.profiles?.full_name}</h1>
        <Badge>{app.status}</Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Nom</span><span>{app.student_profiles?.profiles?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{app.student_profiles?.profiles?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">École</span><span>{app.student_profiles?.school_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Filière</span><span>{app.student_profiles?.field_of_study}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Moyenne</span><span>{app.student_profiles?.gpa}/20</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Crédit</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Montant/mois</span><span>{app.requested_monthly_amount.toLocaleString()} MAD</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Durée</span><span>{app.requested_duration_months} mois</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>{(app.requested_monthly_amount * app.requested_duration_months).toLocaleString()} MAD</span></div>
            <div><p className="text-muted-foreground">Justification</p><p className="text-sm">{app.justification}</p></div>
          </CardContent>
        </Card>
      </div>
      {app.ai_score && (
        <Card>
          <CardHeader><CardTitle>Score AI</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{app.ai_score}/100</p>
            {app.ai_score_breakdown && <div className="mt-4 space-y-2">{Object.entries(app.ai_score_breakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span>{v}/100</span></div>
            ))}</div>}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent>{app.documents.length === 0 ? <p className="text-sm text-muted-foreground">Aucun</p> : (
          <div className="space-y-2">{app.documents.map((d: any) => (
            <div key={d.id} className="flex justify-between rounded-lg border p-3"><span>{d.doc_type}</span><Badge variant={d.verified ? "default" : "secondary"}>{d.verified ? "Vérifié" : "En attente"}</Badge></div>
          ))}</div>
        )}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent><div className="flex gap-2"><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note..." /><Button onClick={saveNotes} variant="outline" size="sm">Sauver</Button></div></CardContent>
      </Card>
      <div className="flex gap-4">
        <Button onClick={() => act("score")} disabled={loading_action}>Scorer</Button>
        <Button onClick={() => act("approve")} variant="secondary" disabled={loading_action}>Approuver</Button>
        <Button onClick={() => act("reject")} variant="destructive" disabled={loading_action}>Refuser</Button>
      </div>
    </div>
  );
}
