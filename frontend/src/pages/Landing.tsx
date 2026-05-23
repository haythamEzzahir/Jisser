import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, Building2, Handshake, ArrowRight, CheckCircle, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/shared/app-shell";

const steps = [
  {
    icon: GraduationCap,
    title: "Inscris-toi",
    description: "Crée ton compte en 2 minutes. Choisis ton montant et télécharge tes documents.",
  },
  {
    icon: Sparkles,
    title: "Soumet ton dossier",
    description: "Notre IA évalue ton profil et te match avec l'entreprise idéale pour ton projet.",
  },
  {
    icon: Handshake,
    title: "Signe ton contrat",
    description: "Reçois ton premier versement. Rembourse en travaillant après ton diplôme.",
  },
];

const stats = [
  { icon: Building2, value: "50+", label: "Entreprises partenaires" },
  { icon: GraduationCap, value: "200+", label: "Étudiants financés" },
  { icon: TrendingUp, value: "95%", label: "Taux d'insertion" },
  { icon: ShieldCheck, value: "0%", label: "Intérêt" },
];

export default function Home() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "admin") navigate("/admin/dashboard");
      else if (profile.role === "company") navigate("/company/dashboard");
      else navigate("/dashboard");
    }
  }, [profile, loading, navigate]);

  return (
    <Shell>
      <div className="flex min-h-screen flex-col">
        <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Jisser" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold tracking-tight">Jisser</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Connexion</Link>
              <Button asChild size="sm">
                <Link to="/register">Postuler →</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden pt-32 pb-20">
            <div className="absolute inset-0 bg-gradient-warm" />
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="absolute top-0 right-0 -mr-40 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.03)_0%,_transparent_50%)]" />
            <div className="absolute -bottom-20 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-accent/8 blur-3xl" />
            <div className="mx-auto max-w-5xl px-6 text-center relative">
              <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
                <Sparkles className="h-4 w-4" />
                La plateforme N°1 du crédit étudiant par le service
              </div>
              <h1 className="animate-fade-in-up font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                Étudie maintenant,<br />
                <span className="bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent">
                  rembourse après ton diplôme
                </span>
              </h1>
              <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
                Jisser connecte les étudiants ambitieux aux entreprises qui investissent dans leur avenir.
                <span className="block mt-2 font-semibold text-foreground">0% d'intérêt. 100% d'opportunité.</span>
              </p>
              <div className="animate-fade-in-up mt-10 flex items-center justify-center gap-4" style={{ animationDelay: "0.2s" }}>
                <Button size="lg" asChild className="gap-2">
                  <Link to="/register">Postuler maintenant <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Connexion</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="relative border-y py-12">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="animate-fade-in-up group text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-display text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="relative py-24">
            <div className="absolute inset-0 bg-gradient-warm" />
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="mx-auto max-w-6xl px-6 relative">
              <div className="text-center">
                <h2 className="animate-fade-in-up font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Comment ça marche ?
                </h2>
                <p className="animate-fade-in-up mt-4 text-muted-foreground max-w-md mx-auto" style={{ animationDelay: "0.1s" }}>
                  Trois étapes simples pour financer tes études et construire ton avenir professionnel
                </p>
              </div>
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={i}
                      className="animate-fade-in-up group relative"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-primary/15 to-secondary/15 opacity-0 blur transition-opacity group-hover:opacity-100" />
                      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-secondary opacity-60" />
                        <CardContent className="p-8">
                          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="mb-3 flex items-center gap-3">
                            <span className="font-display text-3xl font-bold text-primary/30">0{i + 1}</span>
                            <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* For Companies */}
          <section className="relative overflow-hidden border-y bg-gradient-warm py-24">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="mx-auto max-w-6xl px-6 relative">
              <div className="grid items-center gap-12 md:grid-cols-2">
                <div className="animate-fade-in-up">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary mb-6">
                    <Building2 className="h-4 w-4" />
                    Pour les entreprises
                  </div>
                  <h2 className="font-display text-3xl font-bold md:text-4xl">
                    Investissez dans les talents de demain
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Formez et recrutez vos futurs collaborateurs avant la fin de leurs études.
                    Réduisez vos coûts de recrutement tout en ayant un impact social fort.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Accédez à des profils présélectionnés par notre IA",
                      "Réduisez vos coûts de recrutement de 40%",
                      "Valorisez votre marque employeur",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-8 gap-2" variant="secondary">
                    <Link to="/register">Rejoindre comme entreprise <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="animate-fade-in-up relative" style={{ animationDelay: "0.2s" }}>
                  <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">ROI estimé</p>
                        <p className="text-sm text-muted-foreground">Retour sur investissement</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Investissement moyen</span>
                        <span className="font-medium">120 000 MAD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Économie sur recrutement</span>
                        <span className="font-medium text-secondary">~ 48 000 MAD</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">ROI total</span>
                          <span className="font-heading text-2xl font-bold text-secondary">+40%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative py-24">
            <div className="absolute inset-0 bg-gradient-warm" />
            <div className="mx-auto max-w-3xl px-6 text-center relative">
              <div className="animate-fade-in-up rounded-3xl border bg-card p-12 shadow-xl shadow-primary/5">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  Prêt à construire ton avenir ?
                </h2>
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                  Rejoins des centaines d&apos;étudiants qui financent leurs études sans intérêt.
                </p>
                <Button size="lg" asChild className="mt-8 gap-2 shadow-lg shadow-primary/20">
                  <Link to="/register">Postuler maintenant <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Jisser" className="h-5 w-5" />
                <span className="font-heading font-bold tracking-tight">Jisser</span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Conformément aux lois 09-08 et 43-20 relatives à la protection des données et à la signature électronique.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Shell>
  );
}
