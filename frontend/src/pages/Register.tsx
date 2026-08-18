import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, Building2, ArrowRight, User, Mail, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shared/app-shell";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "company">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setError(""); setLoading(true);
    try {
      await register(email, password, fullName, role);
      toast.success("Compte créé avec succès ! Connecte-toi.");
      navigate("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <Shell>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
        <div className="animate-fade-in-up w-full max-w-lg">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/logo.png" alt="Jisser" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold tracking-tight">Jisser</span>
            </Link>
          </div>
          <Card className="border-none shadow-xl shadow-primary/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                {role === "student" ? <GraduationCap className="h-6 w-6 text-primary" /> : <Building2 className="h-6 w-6 text-primary" />}
              </div>
              <CardTitle className="font-heading text-2xl">Créer ton compte</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Étape {step} sur 2</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-center gap-1">
                {[1, 2].map((s) => (
                  <div key={s} className={`flex h-2 w-16 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Je suis un(e)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant={role === "student" ? "default" : "outline"} onClick={() => setRole("student")} className="h-20 flex-col gap-1">
                          <GraduationCap className="h-5 w-5" />
                          <span className="text-xs">Étudiant</span>
                        </Button>
                        <Button type="button" variant={role === "company" ? "default" : "outline"} onClick={() => setRole("company")} className="h-20 flex-col gap-1">
                          <Building2 className="h-5 w-5" />
                          <span className="text-xs">Entreprise</span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="etu@universite.ma" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      Suivant <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">Nom complet</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="fullName" placeholder={role === "student" ? "Jean Dupont" : "Nom de l'entreprise"} value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-10" />
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4 text-sm">
                      <p className="font-medium">Récapitulatif</p>
                      <p className="mt-1 text-muted-foreground">
                        {role === "student" ? "Étudiant" : "Entreprise"} · {email}
                      </p>
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? "Inscription..." : "Créer mon compte"} {loading ? null : <Check className="h-4 w-4" />}
                    </Button>
                  </>
                )}
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Connecte-toi</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
