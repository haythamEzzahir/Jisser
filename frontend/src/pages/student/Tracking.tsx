import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Payment, CreditApplication } from "@/types";
import { Shell } from "@/components/shared/app-shell";

export default function TrackingPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [application, setApplication] = useState<CreditApplication | null>(null);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/students/credit-request").then((r: any) => setApplication(r.data)).catch(() => {});
    api.get("/api/students/payments").then((r: any) => setPayments(r.data || [])).catch(() => {});
  }, [profile]);

  if (loading || !profile) return null;

  const steps = [
    { key: "submitted", label: "Déposé", done: !!application },
    { key: "scored", label: "Évalué", done: application?.ai_score != null },
    { key: "matched", label: "Matché", done: ["matched", "contract_proposed", "contract_accepted", "active"].includes(application?.status || "") },
    { key: "signed", label: "Contrat signé", done: ["contract_accepted", "active"].includes(application?.status || "") },
    { key: "active", label: "Actif", done: ["active", "completed"].includes(application?.status || "") },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Suivi</h1>
        <Card>
          <CardHeader><CardTitle>Progression</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s.done ? "✓" : i + 1}
                  </div>
                  <span className={s.done ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Paiements</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun paiement</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{p.amount.toLocaleString()} MAD</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.due_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <Badge variant={p.status === "paid" ? "default" : p.status === "overdue" ? "destructive" : "secondary"}>
                      {p.status === "paid" ? "Payé" : p.status === "overdue" ? "En retard" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
