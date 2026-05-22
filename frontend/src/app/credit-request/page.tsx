"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Calculator, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreditRequestPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState(2000);
  const [duration, setDuration] = useState(36);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [profile, loading, router]);

  const total = amount * duration;
  const commission = total * 0.10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await api.post("/api/students/credit-request", {
        requested_monthly_amount: amount,
        requested_duration_months: duration,
        justification,
      });
      toast.success("Demande soumise avec succès !");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (loading || !profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Demande de crédit</h1>
          <p className="text-sm text-muted-foreground">Configure le financement de tes études</p>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Montant du financement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Montant mensuel</label>
                <span className="font-heading text-2xl font-bold text-primary">{amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MAD</span></span>
              </div>
              <Input type="range" min={1000} max={5000} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="h-2 accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 000 MAD</span>
                <span>3 000 MAD</span>
                <span>5 000 MAD</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Durée de remboursement</label>
              <div className="grid grid-cols-3 gap-2">
                {[24, 36, 48].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={duration === d ? "default" : "outline"}
                    onClick={() => setDuration(d)}
                    className={`h-16 flex-col gap-0 ${duration === d ? "shadow-md" : ""}`}
                  >
                    <span className="text-base font-bold">{d}</span>
                    <span className="text-xs font-normal opacity-70">mois</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 space-y-3">
              <p className="font-semibold text-sm">Récapitulatif financier</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Crédit total</span>
                <span className="font-medium">{total.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission plateforme (10%)</span>
                <span className="font-medium">{commission.toLocaleString()} MAD</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Investissement entreprise</span>
                  <span className="text-lg">{(total + commission).toLocaleString()} MAD</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Remboursable en travaillant 2 à 3 ans après diplôme</p>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="justification" className="text-sm font-medium">Justification de ta demande</label>
              <textarea
                id="justification"
                className="mt-1 flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Explique ton projet d'études, tes objectifs de carrière, et comment ce financement t'aidera..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                {justification.length} caractères · Sois précis et convaincant
              </p>
            </div>

            <Button type="submit" className="w-full gap-2 h-12 text-base" disabled={submitting}>
              {submitting ? "Envoi en cours..." : "Soumettre ma demande"} <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
