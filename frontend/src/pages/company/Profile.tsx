import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Shell } from "@/components/shared/app-shell";
import {
  Building2, ArrowLeft, ArrowRight, Save, MapPin, Tag,
  Users, FileText, Phone, User, Globe
} from "lucide-react";
import { toast } from "sonner";

interface CompanyForm {
  company_name: string;
  sector: string;
  size: string;
  city: string;
  rc_number: string;
  description: string;
  contact_name: string;
  contact_phone: string;
}

export default function CompanyProfilePage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<CompanyForm>({
    company_name: "", sector: "", size: "", city: "",
    rc_number: "", description: "", contact_name: "", contact_phone: "",
  });

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (!loading && profile && profile.role !== "company") navigate("/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/companies/profile").then((r: any) => {
      if (r.data) {
        setForm({
          company_name: r.data.company_name || "",
          sector: r.data.sector || "",
          size: r.data.size || "",
          city: r.data.city || "",
          rc_number: r.data.rc_number || "",
          description: r.data.description || "",
          contact_name: r.data.contact_name || "",
          contact_phone: r.data.contact_phone || "",
        });
      }
    }).catch(() => {}).finally(() => setFetching(false));
  }, [profile]);

  const update = (key: keyof CompanyForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/companies/profile", form);
      toast.success("Profil entreprise enregistré !");
      navigate("/company/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally { setSaving(false); }
  };

  if (loading || !profile || fetching) return null;

  return (
    <Shell>
      <div className="mx-auto max-w-2xl space-y-8 pb-16">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep((s) => s - 1) : navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Profil entreprise</h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 ? "Informations générales" : "Description & Contact"}
            </p>
          </div>
        </div>

        {/* Step 1: Company info */}
        {step === 1 && (
          <Card className="overflow-hidden border-none shadow-lg border-t-2 border-t-secondary">
            <div className="h-2 bg-gradient-to-r from-secondary to-primary" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-secondary" : "bg-muted"}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-secondary" />
                <CardTitle>Informations générales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Nom de l'entreprise
                </label>
                <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Jisser SARL" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    Secteur d'activité
                  </label>
                  <Input value={form.sector} onChange={(e) => update("sector", e.target.value)} placeholder="Tech, Finance, Industrie..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    Taille de l'entreprise
                  </label>
                  <Input value={form.size} onChange={(e) => update("size", e.target.value)} placeholder="PME, Grande entreprise..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Ville
                  </label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Casablanca" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Numéro RC
                  </label>
                  <Input value={form.rc_number} onChange={(e) => update("rc_number", e.target.value)} placeholder="123456" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} className="gap-1" disabled={!form.company_name}>
                  Suivant <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Description & Contact */}
        {step === 2 && (
          <Card className="overflow-hidden border-none shadow-lg border-t-2 border-t-secondary">
            <div className="h-2 bg-gradient-to-r from-secondary to-primary" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-secondary" : "bg-muted"}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-secondary" />
                <CardTitle>Description & Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Description de l'entreprise
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-secondary focus:ring-1 focus:ring-secondary"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Présente ton entreprise, ta mission, tes valeurs..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Nom du contact
                  </label>
                  <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Jean Dupont" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Téléphone du contact
                  </label>
                  <Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="06 12 34 56 78" />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Précédent
                </Button>
                <Button onClick={handleSave} className="gap-2" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"} <Save className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
