import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { CreditApplication, StudentProfile, Payment, Document } from "@/types";
import { Shell } from "@/components/shared/app-shell";
import { OnboardingCarousel } from "@/components/student/onboarding-carousel";
import {
  GraduationCap, CreditCard, TrendingUp, ArrowRight, FileText, CheckCircle2,
  Clock, AlertCircle, UserCheck, Upload, Brain, Handshake, FileSignature,
  DollarSign, Circle, CheckCircle, Loader2, School, Sparkles
} from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "En attente", under_review: "En révision", scoring_done: "Scoré",
  matched: "Matché", contract_proposed: "Contrat proposé", contract_accepted: "Accepté",
  rejected: "Refusé", active: "Actif", completed: "Terminé",
};

const steps = [
  {
    icon: UserCheck, title: "Complète ton profil",
    desc: "Ajoute ton école, ta filière et ta moyenne",
    action: { label: "Compléter", to: "/credit-request" },
    check: (s: StudentProfile | null) => !!s?.school_name,
  },
  {
    icon: FileText, title: "Soumet ta demande",
    desc: "Choisis ton montant et explique ton projet",
    action: { label: "Postuler", to: "/credit-request" },
    check: (_s: StudentProfile | null, a: CreditApplication | null) => !!a,
  },
  {
    icon: Upload, title: "Télécharge tes documents",
    desc: "CIN, relevé de notes, CV, lettre de motivation",
    action: { label: "Documents", to: "/documents" },
    check: (_s: StudentProfile | null, _a: CreditApplication | null, _p: Payment[], _d: Document[]) => true,
    skipIfNoApp: true,
  },
  {
    icon: Brain, title: "Évaluation IA",
    desc: "Notre IA analyse ton dossier",
    action: null,
    check: (_s: StudentProfile | null, a: CreditApplication | null) =>
      !!a && !["pending"].includes(a.status),
    isWaiting: (_s: StudentProfile | null, a: CreditApplication | null) =>
      !!a && ["pending", "under_review"].includes(a.status),
  },
  {
    icon: Handshake, title: "Matching",
    desc: "Trouver l'entreprise idéale",
    action: null,
    check: (_s: StudentProfile | null, a: CreditApplication | null) =>
      !!a && ["scoring_done", "matched", "contract_proposed", "contract_accepted", "active", "completed"].includes(a.status),
    isWaiting: (_s: StudentProfile | null, a: CreditApplication | null) =>
      !!a && a.status === "scoring_done",
  },
  {
    icon: FileSignature, title: "Signe ton contrat",
    desc: "Accepte les termes du financement",
    action: { label: "Voir le contrat", to: "/contract" },
    check: (_s: StudentProfile | null, a: CreditApplication | null) =>
      !!a && ["contract_proposed", "contract_accepted", "active", "completed"].includes(a.status),
  },
  {
    icon: DollarSign, title: "Reçois tes versements",
    desc: "Paiements mensuels pour tes études",
    action: { label: "Suivi", to: "/tracking" },
    check: (_s: StudentProfile | null, a: CreditApplication | null) =>
      !!a && ["active", "completed"].includes(a.status),
  },
];

export default function StudentDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [application, setApplication] = useState<CreditApplication | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showCarousel, setShowCarousel] = useState(() => !localStorage.getItem("carousel_dismissed"));

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
    if (profile?.role === "company") navigate("/company/dashboard");
    if (profile?.role === "admin") navigate("/admin/dashboard");
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/students/profile").then((r: any) => setStudentProfile(r.data)).catch(() => {});
    api.get("/api/students/credit-request").then((r: any) => setApplication(r.data)).catch(() => {});
    api.get("/api/students/payments").then((r: any) => setPayments(r.data?.slice(0, 5) || [])).catch(() => {});
    api.get("/api/students/documents").then((r: any) => setDocuments(r.data || [])).catch(() => {});
  }, [profile]);

  if (loading || !profile) return null;

  const currentStepIndex = (() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      const s = steps[i];
      if (s.check(studentProfile, application, payments, documents)) return i;
    }
    return -1;
  })();

  const isRejected = application?.status === "rejected";

  const carouselSteps = [
    {
      icon: UserCheck, title: "Complète ton profil",
      description: "Ajoute tes informations personnelles pour que les entreprises puissent te découvrir.",
      details: ["Ton école et ta filière", "Ta moyenne générale /20", "Ta ville et une courte bio"],
      action: { label: "Compléter", to: "/credit-request" },
    },
    {
      icon: FileText, title: "Soumet ta demande de crédit",
      description: "Choisis le montant mensuel et la durée de financement dont tu as besoin.",
      details: ["Montant de 1 000 à 5 000 MAD/mois", "Durée de 24 à 48 mois", "Explique ton projet en détail"],
      action: { label: "Postuler", to: "/credit-request" },
    },
    {
      icon: Upload, title: "Télécharge tes documents",
      description: "Fournis les pièces justificatives nécessaires à l'évaluation de ton dossier.",
      details: ["CIN ou passeport", "Relevé de notes et certificat de scolarité", "CV et lettre de motivation"],
      action: { label: "Documents", to: "/documents" },
    },
    {
      icon: Brain, title: "Évaluation par l'IA",
      description: "Notre intelligence artificielle analyse ton profil et ta motivation.",
      details: ["Score académique, potentiel, motivation", "Analyse automatique de tes documents", "Rapport détaillé pour les entreprises"],
      action: null,
    },
    {
      icon: Handshake, title: "Matching avec une entreprise",
      description: "Nous trouvons l'entreprise idéale qui correspond à ton profil.",
      details: ["Suggestions personnalisées par l'IA", "Une entreprise dans ton domaine d'études", "Un investisseur pour ton avenir"],
      action: null,
    },
    {
      icon: School, title: "Signe ton contrat",
      description: "Accepte le contrat tripartite et reçois ton premier versement.",
      details: ["Contrat en français signé électroniquement", "Versement mensuel garanti", "Remboursement en travaillant 2-3 ans"],
      action: null,
    },
    {
      icon: Sparkles, title: "Prêt pour la réussite !",
      description: "Tu suis tes études sereinement et tu rembourses après ton diplôme.",
      details: ["Paiements mensuels automatiques", "Suivi de tes notes chaque semestre", "Stage et emploi garantis chez ton partenaire"],
      action: null,
    },
  ];

  return (
    <Shell>
      {showCarousel && !studentProfile && (
        <OnboardingCarousel
          steps={carouselSteps}
          onDismiss={() => { localStorage.setItem("carousel_dismissed", "true"); setShowCarousel(false); }}
        />
      )}
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Bon retour, {profile.full_name.split(" ")[0]} !</h1>
          <p className="text-muted-foreground">Voici ton parcours vers ton financement</p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary md:flex">
          <GraduationCap className="h-4 w-4" />
          {studentProfile?.school_name || "Étudiant"}
        </div>
      </div>

      {isRejected && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Dossier refusé</p>
              <p className="text-sm text-muted-foreground">
                {application?.rejection_reason || "Tu pourras soumettre une nouvelle demande dans 6 mois."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Statut du dossier</CardTitle>
          </CardHeader>
          <CardContent>
            {application ? (
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 border">
                  {statusLabels[application.status] || application.status}
                </Badge>
                {application.ai_score && (
                  <p className="text-xs text-muted-foreground">Score IA: {application.ai_score}/100</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pas encore de dossier</p>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Prochain paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{payments.length > 0 ? `${payments[0].amount.toLocaleString()} MAD` : "—"}</p>
            {payments.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{new Date(payments[0].due_date).toLocaleDateString("fr-FR")}</p>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{studentProfile?.gpa ? `${studentProfile.gpa}/20` : "—"}</p>
            {studentProfile?.field_of_study && (
              <p className="text-xs text-muted-foreground mt-1">{studentProfile.field_of_study}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-t-2 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Ton parcours vers le financement</CardTitle>
          </div>
          {application && (
            <p className="text-sm text-muted-foreground mt-1">
              Étape {Math.max(currentStepIndex + 1, 1)} sur {steps.length}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {steps.map((step, i) => {
                const done = i <= currentStepIndex;
                const waiting = step.isWaiting?.(studentProfile, application) ?? false;
                const show = !step.skipIfNoApp || !!application;

                if (!show) return null;

                return (
                  <div key={i} className="relative flex items-start gap-4 pl-0">
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : waiting
                          ? "border-amber-400 bg-amber-50 text-amber-500"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle className="h-4 w-4" /> :
                       waiting ? <Loader2 className="h-4 w-4 animate-spin" /> :
                       <Circle className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 pb-2 ${done ? "" : "opacity-50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                        {step.action && !done && (
                          <Button asChild size="sm" variant={i === 0 ? "default" : "outline"}>
                              <Link to={step.action.to}>
                                {step.action.label} <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          {done && step.action && (
                            <Button asChild size="sm" variant="ghost">
                              <Link to={step.action.to}>
                                Voir <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          {waiting && (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">
                              En cours...
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </CardContent>
      </Card>

      {!application && studentProfile && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10">
                <CheckCircle2 className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Prêt à postuler !</p>
                <p className="text-sm text-muted-foreground">Fais ta demande de crédit maintenant</p>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link to="/credit-request">Postuler <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!studentProfile && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Complète ton profil</p>
                <p className="text-sm text-muted-foreground">Ajoute tes informations pour commencer</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/credit-request">Compléter <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {application && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Dernière activité</CardTitle>
            {application.status === "active" && <Badge variant="default">Actif</Badge>}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Dossier créé le {new Date(application.created_at).toLocaleDateString("fr-FR")}</p>
                <p className="text-sm text-muted-foreground">
                  {application.requested_monthly_amount.toLocaleString()} MAD/mois · {application.requested_duration_months} mois
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/tracking">Suivi <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </Shell>
  );
}
