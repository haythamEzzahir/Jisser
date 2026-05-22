"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { CompanyNeed } from "@/types";

export default function NeedsPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [needs, setNeeds] = useState<CompanyNeed[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/companies/needs").then((r: any) => setNeeds(r.data || [])).catch(() => {});
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/companies/needs", { title, field_of_study: field, description: desc, investment_budget: budget, contract_duration_months: 36 });
      const r = await api.get<any>("/api/companies/needs");
      setNeeds(r.data || []);
      setShowForm(false); setTitle(""); setField(""); setDesc(""); setBudget(0);
    } catch { alert("Erreur"); } finally { setSubmitting(false); }
  };

  if (loading || !profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Besoins</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Annuler" : "Nouveau besoin"}</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Publier un besoin</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-medium">Titre</label><Input placeholder="Développeur Full Stack" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Filière</label><Input placeholder="Informatique" value={field} onChange={(e) => setField(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Description</label><textarea className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Budget (MAD)</label><Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></div>
              <Button type="submit" disabled={submitting} className="w-full">{submitting ? "..." : "Publier"}</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Mes besoins</CardTitle></CardHeader>
        <CardContent>
          {needs.length === 0 ? <p className="text-sm text-muted-foreground">Aucun besoin</p> : (
            <div className="space-y-3">{needs.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium">{n.title}</p><p className="text-sm text-muted-foreground">{n.field_of_study}{n.investment_budget && ` · ${n.investment_budget.toLocaleString()} MAD`}</p></div>
                <Badge variant={n.status === "open" ? "default" : "secondary"}>{n.status === "open" ? "Ouvert" : "Fermé"}</Badge>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
