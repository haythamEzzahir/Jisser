import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shared/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Contract } from "@/types";
import { toast } from "sonner";

export default function ContractsPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (profile?.role === "student") navigate("/dashboard");
    if (profile?.role === "company") navigate("/company/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/admin/contracts").then((r: any) => setContracts(r.data || [])).catch(() => {});
  }, [profile]);

  const propose = async (contractId: string) => {
    try {
      await api.post(`/api/admin/contracts/${contractId}/propose`);
      const r = await api.get<any>("/api/admin/contracts");
      setContracts(r.data || []);
      toast.success("Contrat proposé à l'étudiant");
    } catch { toast.error("Erreur"); }
  };

  if (loading || !profile) return null;

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Contrats</h1>
        <Card>
          <CardHeader><CardTitle>Tous les contrats</CardTitle></CardHeader>
          <CardContent>
            {contracts.length === 0 ? <p className="text-sm text-muted-foreground">Aucun contrat</p> : (
              <div className="space-y-3">{contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{c.monthly_amount.toLocaleString()} MAD/mois</p>
                    <p className="text-sm text-muted-foreground">{c.duration_months} mois · {c.total_credit_amount.toLocaleString()} MAD total</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{c.status}</Badge>
                    {c.status === "draft" && <Button size="sm" onClick={() => propose(c.id)}>Proposer</Button>}
                  </div>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
