"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Contract } from "@/types";
import { FileCheck, Check, X, Calendar, DollarSign, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  proposed: { label: "Proposé", variant: "secondary" },
  accepted: { label: "Accepté", variant: "default" },
  active: { label: "Actif", variant: "default" },
  completed: { label: "Terminé", variant: "outline" },
  terminated: { label: "Refusé", variant: "destructive" },
  bought_out: { label: "Racheté", variant: "secondary" },
};

export default function ContractPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/students/contract").then((r: any) => setContract(r.data)).catch(() => {}).finally(() => setFetching(false));
  }, [profile]);

  const handleAccept = async () => {
    if (!contract) return;
    setActionLoading(true);
    try {
      await api.post(`/api/students/contract/${contract.id}/accept`);
      setContract({ ...contract, status: "accepted" });
      toast.success("Contrat accepté !");
    } catch { toast.error("Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleRefuse = async () => {
    if (!contract) return;
    setActionLoading(true);
    try {
      await api.post(`/api/students/contract/${contract.id}/refuse`);
      setContract({ ...contract, status: "terminated" });
      toast.error("Contrat refusé");
    } catch { toast.error("Erreur"); }
    finally { setActionLoading(false); }
  };

  if (loading || !profile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mon contrat</h1>
        <p className="text-muted-foreground">Consulte et gère ton engagement</p>
      </div>

      {fetching ? (
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : !contract ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FileCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">Aucun contrat pour le moment</p>
            <p className="text-sm text-muted-foreground">Une fois ton dossier accepté, le contrat apparaîtra ici</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Détails du contrat</CardTitle>
                </div>
                <Badge variant={statusMap[contract.status]?.variant || "outline"}>
                  {statusMap[contract.status]?.label || contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" /> Mensuel
                  </div>
                  <p className="text-lg font-bold">{contract.monthly_amount.toLocaleString()} MAD</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Durée
                  </div>
                  <p className="text-lg font-bold">{contract.duration_months} mois</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" /> Total
                  </div>
                  <p className="text-lg font-bold">{contract.total_credit_amount.toLocaleString()} MAD</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" /> Engagement
                  </div>
                  <p className="text-lg font-bold">{contract.work_duration_months} mois</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Remboursement par travail après l&apos;obtention du diplôme
                </div>
              </div>
            </CardContent>
          </Card>

          {contract.contract_text && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Texte du contrat</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted p-6 text-sm leading-relaxed">
                  {contract.contract_text}
                </div>
              </CardContent>
            </Card>
          )}

          {contract.status === "proposed" && (
            <div className="flex flex-col gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
              <p className="text-center text-sm font-medium">Tu as jusqu&apos;au {new Date(contract.student_response_deadline || "").toLocaleDateString("fr-FR")} pour répondre</p>
              <div className="flex gap-4">
                <Button onClick={handleAccept} disabled={actionLoading} className="flex-1 gap-2 h-12 text-base">
                  <Check className="h-5 w-5" /> Accepter le contrat
                </Button>
                <Button onClick={handleRefuse} variant="destructive" disabled={actionLoading} className="flex-1 gap-2 h-12 text-base">
                  <X className="h-5 w-5" /> Refuser
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
