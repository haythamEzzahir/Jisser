import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Shell } from "@/components/shared/app-shell";

export default function AssignedStudentsPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/companies/assigned-students").then((r: any) => setStudents(r.data || [])).catch(() => {});
  }, [profile]);

  if (loading || !profile) return null;

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Étudiants assignés</h1>
        <Card>
          <CardHeader><CardTitle>Liste</CardTitle></CardHeader>
          <CardContent>
            {students.length === 0 ? <p className="text-sm text-muted-foreground">Aucun étudiant</p> : (
              <div className="space-y-3">{students.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{s.student_profiles?.profiles?.full_name || "Étudiant"}</p>
                    <p className="text-sm text-muted-foreground">{s.student_profiles?.field_of_study} · {s.monthly_amount.toLocaleString()} MAD/mois</p>
                  </div>
                  <Badge>{s.status}</Badge>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
