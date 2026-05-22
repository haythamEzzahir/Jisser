"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

import {
  GraduationCap, Send, ArrowLeft, ArrowRight, User, MapPin, Calendar, Phone,
  School, Award, Trophy, Building, Users, Home, Bus, Lightbulb, Target, Star,
  Code, Globe, Briefcase, Heart, CheckCircle, BookOpen, FileText,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

type Level = "bac" | "bac+1" | "bac+2" | null;

interface FormData {
  level: Level;
  nom: string;
  age: string;
  telephone: string;
  ville: string;
  note_bac: string;
  note_bac_regional: string;
  note_bac_national: string;
  filiere_bac: string;
  classement: string;
  concours: string;
  ecole_acceptee: string;
  ville_ecole: string;
  revenus_parents: string;
  nb_freres_soeurs: string;
  besoin_logement: boolean;
  besoin_transport: boolean;
  moyenne_s1: string;
  moyenne_s2: string;
  absences: string;
  modules_valides: string;
  clubs: string;
  hackathons: string;
  certifications: string;
  langages: string;
  soft_skills: string;
  projets: string;
  portfolio: string;
  github: string;
  linkedin: string;
  stages: string;
  freelance: string;
  secteurs: string;
  entreprises_ciblees: string;
  centre_interet: string;
  motivation_ecole: string;
  projet_pro: string;
  ambition: string;
}

const initialForm: FormData = {
  level: null,
  nom: "", age: "", telephone: "", ville: "",
  note_bac: "", note_bac_regional: "", note_bac_national: "", filiere_bac: "", classement: "", concours: "",
  ecole_acceptee: "", ville_ecole: "",
  revenus_parents: "", nb_freres_soeurs: "", besoin_logement: false, besoin_transport: false,
  moyenne_s1: "", moyenne_s2: "", absences: "", modules_valides: "",
  clubs: "", hackathons: "", certifications: "",
  langages: "", soft_skills: "", projets: "", portfolio: "", github: "", linkedin: "",
  stages: "", freelance: "", secteurs: "", entreprises_ciblees: "",
  centre_interet: "",
  motivation_ecole: "", projet_pro: "", ambition: "",
};

const levelLabels: Record<string, string> = {
  bac: "BAC (Bachelier)",
  "bac+1": "BAC+1 (1ère année universitaire)",
  "bac+2": "BAC+2 (2ème année universitaire)",
};

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b pb-3 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="font-heading font-semibold">{title}</h3>
    </div>
  );
}

export default function CreditRequestPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
    if (!loading && profile && profile.role !== "student") router.push(`/${profile.role}/dashboard`);
  }, [profile, loading, router]);

  const update = (key: keyof FormData, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await api.put("/api/students/profile", {
        school_name: form.ecole_acceptee || form.filiere_bac,
        field_of_study: form.filiere_bac,
        gpa: form.note_bac_national ? parseFloat(form.note_bac_national) : form.note_bac ? parseFloat(form.note_bac) : undefined,
        city: form.ville,
        bio: form.ambition,
        education_level: form.level,
        extra_data: form,
      });
      toast.success("Profil enregistré !");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  };

  if (loading || !profile) return null;

  const totalSteps = form.level === "bac" ? 4 : form.level === "bac+1" ? 4 : form.level === "bac+2" ? 5 : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep((s) => s - 1) : router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Demande de financement</h1>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? "Commençons par ton niveau d'études" : `Étape ${step - 1} sur ${Math.max(totalSteps - 1, 1)}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* STEP 1: Level selection */}
      {step === 1 && (
        <Card className="overflow-hidden border-none shadow-lg border-t-2 border-t-primary">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl">Quel est ton niveau d'études ?</CardTitle>
            <p className="text-muted-foreground mt-1">Le formulaire s'adapte à ton profil</p>
          </CardHeader>
          <CardContent className="space-y-3 pb-8">
            {(["bac", "bac+1", "bac+2"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => { update("level", lvl); setStep(2); }}
                className={`group relative w-full rounded-xl border-2 p-5 text-left transition-all hover:border-primary hover:shadow-md ${
                  form.level === lvl ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                    form.level === lvl ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10"
                  }`}>
                    {lvl === "bac" ? <Star className="h-6 w-6" /> :
                     lvl === "bac+1" ? <BookOpen className="h-6 w-6" /> :
                     <Code className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{levelLabels[lvl]}</p>
                    <p className="text-sm text-muted-foreground">
                      {lvl === "bac" ? "Évaluation du potentiel académique" :
                       lvl === "bac+1" ? "Performance et adaptation universitaires" :
                       "Compétences et employabilité"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Personal Info + Academic */}
      {step === 2 && form.level && (
        <Card className="overflow-hidden border-none shadow-lg border-t-2 border-t-primary">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {[1,2,3,4,5].slice(0, totalSteps).map((s) => (
                <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Informations personnelles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionTitle icon={User} title="Identité & Situation" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nom complet" icon={User} value={form.nom} onChange={(v) => update("nom", v)} placeholder="Jean Dupont" />
              <Field label="Âge" icon={Calendar} value={form.age} onChange={(v) => update("age", v)} placeholder="18" type="number" />
              <Field label="Ville actuelle" icon={MapPin} value={form.ville} onChange={(v) => update("ville", v)} placeholder="Casablanca" />
              <Field label="Téléphone" icon={Phone} value={form.telephone} onChange={(v) => update("telephone", v)} placeholder="06 12 34 56 78" />
            </div>

            {form.level === "bac" && (
              <>
                <SectionTitle icon={Award} title="Parcours Baccalauréat" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Note du Bac /20" icon={Star} value={form.note_bac} onChange={(v) => update("note_bac", v)} type="number" placeholder="14" />
                  <Field label="Note régionale /20" icon={Award} value={form.note_bac_regional} onChange={(v) => update("note_bac_regional", v)} type="number" placeholder="16" />
                  <Field label="Note nationale /20" icon={Award} value={form.note_bac_national} onChange={(v) => update("note_bac_national", v)} type="number" placeholder="14" />
                  <Field label="Filière Bac" icon={BookOpen} value={form.filiere_bac} onChange={(v) => update("filiere_bac", v)} placeholder="SVT / PC / Maths" />
                  <Field label="Classement régional" icon={Trophy} value={form.classement} onChange={(v) => update("classement", v)} placeholder="1er / 500 (optionnel)" />
                </div>

                <SectionTitle icon={Building} title="Établissement visé" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Concours obtenus" icon={Award} value={form.concours} onChange={(v) => update("concours", v)} placeholder="ENSAM, FST, INSEA..." />
                  <Field label="Ville de l'établissement" icon={MapPin} value={form.ville_ecole} onChange={(v) => update("ville_ecole", v)} placeholder="Casablanca" />
                  <div className="md:col-span-2">
                    <Field label="Centre d'intérêt" icon={Heart} value={form.centre_interet} onChange={(v) => update("centre_interet", v)} placeholder="Informatique, Architecture, Médecine..." />
                  </div>
                </div>

                <SectionTitle icon={Users} title="Situation familiale & besoins" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Revenus mensuels parents (MAD)" icon={Users} value={form.revenus_parents} onChange={(v) => update("revenus_parents", v)} type="number" placeholder="5000" />
                  <Field label="Nombre de frères/sœurs" icon={Users} value={form.nb_freres_soeurs} onChange={(v) => update("nb_freres_soeurs", v)} type="number" placeholder="2" />
                </div>
                <div className="flex gap-6">
                  <CheckboxField label="Besoin de logement" checked={form.besoin_logement} onChange={(v) => update("besoin_logement", v)} icon={Home} />
                  <CheckboxField label="Besoin de transport" checked={form.besoin_transport} onChange={(v) => update("besoin_transport", v)} icon={Bus} />
                </div>
              </>
            )}

            {form.level === "bac+1" && (
              <>
                <SectionTitle icon={BookOpen} title="Performance universitaire" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Note du Bac /20" icon={Star} value={form.note_bac} onChange={(v) => update("note_bac", v)} type="number" placeholder="14" />
                  <Field label="Filière Bac" icon={BookOpen} value={form.filiere_bac} onChange={(v) => update("filiere_bac", v)} placeholder="SVT" />
                  <Field label="Moyenne S1 /20" icon={Award} value={form.moyenne_s1} onChange={(v) => update("moyenne_s1", v)} type="number" placeholder="13" />
                  <Field label="Moyenne S2 /20" icon={Award} value={form.moyenne_s2} onChange={(v) => update("moyenne_s2", v)} type="number" placeholder="14" />
                  <Field label="Nombre d'absences" icon={Calendar} value={form.absences} onChange={(v) => update("absences", v)} type="number" placeholder="0" />
                  <Field label="Modules validés / total" icon={CheckCircle} value={form.modules_valides} onChange={(v) => update("modules_valides", v)} placeholder="10/12" />
                </div>

                <SectionTitle icon={Heart} title="Engagement & Activités" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Clubs & associations" icon={Users} value={form.clubs} onChange={(v) => update("clubs", v)} placeholder="Club robotique, Enactus..." />
                  <Field label="Hackathons" icon={Trophy} value={form.hackathons} onChange={(v) => update("hackathons", v)} placeholder="Hackathon XYZ - 2ème place" />
                  <div className="md:col-span-2">
                    <Field label="Certifications" icon={Award} value={form.certifications} onChange={(v) => update("certifications", v)} placeholder="Python, Excel, TOEIC..." />
                  </div>
                </div>
              </>
            )}

            {form.level === "bac+2" && (
              <>
                <SectionTitle icon={BookOpen} title="Performance universitaire" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Note du Bac /20" icon={Star} value={form.note_bac} onChange={(v) => update("note_bac", v)} type="number" placeholder="14" />
                  <Field label="Filière" icon={BookOpen} value={form.filiere_bac} onChange={(v) => update("filiere_bac", v)} placeholder="Génie Informatique" />
                  <Field label="Moyenne S1 /20" icon={Award} value={form.moyenne_s1} onChange={(v) => update("moyenne_s1", v)} type="number" placeholder="13" />
                  <Field label="Moyenne S2 /20" icon={Award} value={form.moyenne_s2} onChange={(v) => update("moyenne_s2", v)} type="number" placeholder="14" />
                  <Field label="Absences" icon={Calendar} value={form.absences} onChange={(v) => update("absences", v)} type="number" placeholder="0" />
                  <Field label="Modules validés" icon={CheckCircle} value={form.modules_valides} onChange={(v) => update("modules_valides", v)} placeholder="18/20" />
                </div>
              </>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(3)} className="gap-1" disabled={
                (form.level === "bac" && !form.nom) || (form.level === "bac+1" && !form.nom) || (form.level === "bac+2" && !form.nom)
              }>
                Suivant <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Motivation (BAC) / Skills (BAC+1,2) */}
      {step === 3 && form.level && (
        <Card className="overflow-hidden border-none shadow-lg border-t-2 border-t-primary">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {[1,2,3,4,5].slice(0, totalSteps).map((s) => (
                <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>
                {form.level === "bac" ? "Motivation & Projet" :
                 form.level === "bac+1" ? "Motivation & Engagement" : "Compétences & Projets"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {(form.level === "bac" || form.level === "bac+1") && (
              <>
                <TextArea label="Pourquoi cette école ?" icon={Target} value={form.motivation_ecole} onChange={(v) => update("motivation_ecole", v)} placeholder="Explique ton choix d'établissement et pourquoi c'est important pour toi..." />
                <TextArea label="Projet professionnel" icon={Briefcase} value={form.projet_pro} onChange={(v) => update("projet_pro", v)} placeholder="Quel métier veux-tu exercer ?" />
                <TextArea label="Ambition future" icon={Sparkles} value={form.ambition} onChange={(v) => update("ambition", v)} placeholder="Où te vois-tu dans 10 ans ?" />
              </>
            )}

            {form.level === "bac+1" && (
              <>
                <SectionTitle icon={FileText} title="Informations complémentaires" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="École / Université" icon={School} value={form.ecole_acceptee} onChange={(v) => update("ecole_acceptee", v)} placeholder="Université Hassan II" />
                  <Field label="Ville" icon={MapPin} value={form.ville_ecole} onChange={(v) => update("ville_ecole", v)} placeholder="Casablanca" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Revenus parents (MAD)" icon={Users} value={form.revenus_parents} onChange={(v) => update("revenus_parents", v)} type="number" placeholder="5000" />
                  <Field label="Frères/sœurs" icon={Users} value={form.nb_freres_soeurs} onChange={(v) => update("nb_freres_soeurs", v)} type="number" placeholder="2" />
                </div>
                <div className="flex gap-6">
                  <CheckboxField label="Besoin logement" checked={form.besoin_logement} onChange={(v) => update("besoin_logement", v)} icon={Home} />
                  <CheckboxField label="Besoin transport" checked={form.besoin_transport} onChange={(v) => update("besoin_transport", v)} icon={Bus} />
                </div>
              </>
            )}

            {form.level === "bac+2" && (
              <>
                <SectionTitle icon={Code} title="Compétences techniques" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Langages / outils" icon={Code} value={form.langages} onChange={(v) => update("langages", v)} placeholder="Python, React, SQL..." />
                  <Field label="Soft skills" icon={Heart} value={form.soft_skills} onChange={(v) => update("soft_skills", v)} placeholder="Leadership, Communication..." />
                  <div className="md:col-span-2">
                    <TextArea label="Projets réalisés" icon={Code} value={form.projets} onChange={(v) => update("projets", v)} placeholder="Décris tes projets clés..." />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Portfolio" icon={FileText} value={form.portfolio} onChange={(v) => update("portfolio", v)} placeholder="https://..." />
                  <Field label="GitHub" icon={Globe} value={form.github} onChange={(v) => update("github", v)} placeholder="github.com/..." />
                  <Field label="LinkedIn" icon={Globe} value={form.linkedin} onChange={(v) => update("linkedin", v)} placeholder="linkedin.com/in/..." />
                </div>

                <SectionTitle icon={Briefcase} title="Expérience professionnelle" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Stages effectués" icon={Briefcase} value={form.stages} onChange={(v) => update("stages", v)} placeholder="Stage développeur chez ..." />
                  <Field label="Freelance / projets perso" icon={Code} value={form.freelance} onChange={(v) => update("freelance", v)} placeholder="Projets freelance..." />
                </div>

                <SectionTitle icon={Target} title="Objectifs de carrière" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Secteurs souhaités" icon={Target} value={form.secteurs} onChange={(v) => update("secteurs", v)} placeholder="Tech, Finance, Consulting..." />
                  <Field label="Entreprises ciblées" icon={Building} value={form.entreprises_ciblees} onChange={(v) => update("entreprises_ciblees", v)} placeholder="OCP, Attijariwafa..." />
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Précédent
              </Button>
              <Button onClick={() => { handleSave(); setStep(4); }} className="gap-1" disabled={saving}>
                {saving ? "Enregistrement..." : "Suivant"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Credit amount (all levels) or Skills (bac+2) */}
      {step === 4 && form.level && (
        <>
          {form.level === "bac+2" ? (
            <Card className="overflow-hidden border-none shadow-lg border-t-2 border-t-primary">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].slice(0, totalSteps).map((s) => (
                    <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle>Motivation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <TextArea label="Projet professionnel" icon={Target} value={form.projet_pro} onChange={(v) => update("projet_pro", v)} placeholder="Quel métier veux-tu exercer après tes études ?" />
                <TextArea label="Ambition future" icon={Sparkles} value={form.ambition} onChange={(v) => update("ambition", v)} placeholder="Où te vois-tu dans 10 ans ?" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Revenus parents (MAD)" icon={Users} value={form.revenus_parents} onChange={(v) => update("revenus_parents", v)} type="number" placeholder="5000" />
                  <Field label="Frères/sœurs" icon={Users} value={form.nb_freres_soeurs} onChange={(v) => update("nb_freres_soeurs", v)} type="number" placeholder="2" />
                </div>
                <div className="flex gap-6">
                  <CheckboxField label="Besoin logement" checked={form.besoin_logement} onChange={(v) => update("besoin_logement", v)} icon={Home} />
                  <CheckboxField label="Besoin transport" checked={form.besoin_transport} onChange={(v) => update("besoin_transport", v)} icon={Bus} />
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(3)} className="gap-1">
                    <ArrowLeft className="h-4 w-4" /> Précédent
                  </Button>
                  <Button onClick={() => { handleSave(); setStep(5); }} className="gap-1" disabled={saving}>
                    {saving ? "Enregistrement..." : "Suivant"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CreditForm onBack={() => setStep(3)} error={error} setError={setError} />
          )}
        </>
      )}

      {/* STEP 5: Credit form (bac+2 only) */}
      {step === 5 && form.level === "bac+2" && (
        <CreditForm onBack={() => setStep(4)} error={error} setError={setError} />
      )}
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, placeholder, type }: {
  label: string; icon: any; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </label>
      <Input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10" />
    </div>
  );
}

function TextArea({ label, icon: Icon, value, onChange, placeholder }: {
  label: string; icon: any; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </label>
      <textarea
        className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckboxField({ label, icon: Icon, checked, onChange }: {
  label: string; icon: any; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </label>
  );
}

function CreditForm({ onBack, error, setError }: {
  onBack: () => void; error: string; setError: (v: string) => void;
}) {
  const [amount, setAmount] = useState(2000);
  const [duration, setDuration] = useState(36);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const total = amount * duration;
  const commission = total * 0.10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/api/students/credit-request", {
        requested_monthly_amount: amount,
        requested_duration_months: duration,
        justification,
      });
      toast.success("Demande soumise avec succès ! Ajoute maintenant tes documents.");
      router.push("/documents");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle>Configure ton financement</CardTitle>
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
            <label className="text-sm font-medium">Durée</label>
            <div className="grid grid-cols-3 gap-2">
              {[24, 36, 48].map((d) => (
                <Button key={d} type="button" variant={duration === d ? "default" : "outline"}
                  onClick={() => setDuration(d)} className={`h-16 flex-col gap-0 ${duration === d ? "shadow-md" : ""}`}>
                  <span className="text-base font-bold">{d}</span>
                  <span className="text-xs font-normal opacity-70">mois</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 space-y-3">
            <p className="font-semibold text-sm">Récapitulatif</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Crédit total</span>
              <span className="font-medium">{total.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commission (10%)</span>
              <span className="font-medium">{commission.toLocaleString()} MAD</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold">
                <span>Investissement entreprise</span>
                <span className="text-lg">{(total + commission).toLocaleString()} MAD</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Remboursable en travaillant 2-3 ans après diplôme</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Justification</label>
            <textarea
              className="mt-1 flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Explique ton projet d'études et comment ce financement t'aidera..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button type="submit" className="gap-2 h-12 px-8" disabled={submitting}>
              {submitting ? "Envoi..." : "Soumettre ma demande"} <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
