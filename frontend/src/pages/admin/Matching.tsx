import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shared/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface MatchSuggestion { need_id: string; company_name: string; compatibility_score: number; rationale: string; }

export default function MatchingPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [scoredApps, setScoredApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (profile?.role === "student") navigate("/dashboard");
    if (profile?.role === "company") navigate("/company/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/admin/applications?status=scoring_done").then((r: any) => setScoredApps(r.data || [])).catch(() => {});
  }, [profile]);

  const find = async (appId: string) => {
    setSelectedApp(appId); setLoadingMatch(true);
    try { const r = await api.get<any>(`/api/admin/matching/suggestions/${appId}`); setSuggestions(r.data || []); }
    catch { setSuggestions([]); } finally { setLoadingMatch(false); }
  };

  const confirm = async (needId: string) => {
    if (!selectedApp) return;
    try {
      await api.post("/api/admin/matching/confirm", { application_id: selectedApp, need_id: needId });
      setSuggestions([]); setSelectedApp(null);
      setScoredApps((prev) => prev.filter((a) => a.id !== selectedApp));
      toast.success("Match confirmé !");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  if (loading || !profile) return null;

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Matching</h1>
        <Card>
          <CardHeader><CardTitle>Dossiers scorés</CardTitle></CardHeader>
          <CardContent>
            {scoredApps.length === 0 ? <p className="text-sm text-muted-foreground">Aucun dossier en attente</p> : (
              <div className="space-y-3">{scoredApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div><p className="font-medium">Score: {app.ai_score}/100</p><p className="text-sm text-muted-foreground">{app.requested_monthly_amount.toLocaleString()} MAD/mois</p></div>
                  <Button size="sm" onClick={() => find(app.id)} disabled={loadingMatch && selectedApp === app.id}>Matches</Button>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
        {suggestions.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Suggestions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">{suggestions.map((s) => (
                <div key={s.need_id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">{s.company_name}</p><p className="text-sm text-muted-foreground">Compatibilité: {s.compatibility_score}%<br />{s.rationale}</p></div>
                    <Button size="sm" onClick={() => confirm(s.need_id)}>Assigner</Button>
                  </div>
                </div>
              ))}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
