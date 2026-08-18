import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shared/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Payment } from "@/types";
import { toast } from "sonner";

export default function PaymentsPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (profile?.role === "student") navigate("/dashboard");
    if (profile?.role === "company") navigate("/company/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/admin/payments").then((r: any) => setPayments(r.data || [])).catch(() => {});
  }, [profile]);

  const markPaid = async (id: string) => {
    try {
      await api.post(`/api/admin/payments/${id}/mark-paid`);
      const r = await api.get<any>("/api/admin/payments");
      setPayments(r.data || []);
    } catch { toast.error("Erreur"); }
  };

  const generateSchedule = async (contractId: string) => {
    try {
      await api.post(`/api/admin/payments/generate-schedule?contract_id=${contractId}`);
      const r = await api.get<any>("/api/admin/payments");
      setPayments(r.data || []);
      toast.success("Échéancier généré");
    } catch { toast.error("Erreur"); }
  };

  if (loading || !profile) return null;

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Paiements</h1>
        {payments.filter((p) => p.status === "pending").length > 0 && (
          <Card>
            <CardHeader><CardTitle>En attente</CardTitle></CardHeader>
            <CardContent className="space-y-3">{payments.filter((p) => p.status === "pending").map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{p.amount.toLocaleString()} MAD</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.due_date).toLocaleDateString("fr-FR")} · {p.direction === "platform_to_student" ? "→ Étudiant" : "→ Plateforme"}</p>
                </div>
                <Button size="sm" onClick={() => markPaid(p.id)}>Marquer payé</Button>
              </div>
            ))}</CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle>Générer échéancier</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input id="cid" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="ID du contrat" />
              <Button onClick={() => { const el = document.getElementById("cid") as HTMLInputElement; if (el.value) generateSchedule(el.value); }}>Générer</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? <p className="text-sm text-muted-foreground">Aucun</p> : (
              <div className="space-y-2">{payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-medium">{p.amount.toLocaleString()} MAD</p><p className="text-xs text-muted-foreground">{new Date(p.due_date).toLocaleDateString("fr-FR")}</p></div>
                  <Badge variant={p.status === "paid" ? "default" : p.status === "overdue" ? "destructive" : "secondary"}>{p.status === "paid" ? "Payé" : p.status === "overdue" ? "En retard" : "En attente"}</Badge>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
