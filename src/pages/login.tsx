import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Car, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandLogo } from "@/components/brand-logo";

export default function Login() {
  const { login, register, requestPasswordReset, verifyResetCode, resetPassword, isAuthenticated, user } = useStore();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetVerified, setResetVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setLocation(user?.isAdmin ? "/admin" : "/dashboard");
  }, [isAuthenticated, setLocation, user?.isAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    setTimeout(() => {
      if (mode === "reset") {
        if (!resetVerified) {
          setError("Vérifiez le code avant de choisir un nouveau mot de passe.");
          setLoading(false);
          return;
        }
        const result = resetPassword(email, resetCode, password, confirmPassword);
        if (result.ok) {
          setMode("login");
          setSuccess("Mot de passe réinitialisé. Vous pouvez vous connecter.");
          setConfirmPassword("");
          setResetCode("");
          setResetSent(false);
          setResetVerified(false);
        } else {
          setError(result.error || "Réinitialisation échouée.");
        }
        setLoading(false);
        return;
      }

      const result = mode === "login" ? login(name, email, password) : register(name, email, password);

      if (result.ok) {
        setLocation(email.trim().toLowerCase() === BRAND.adminEmail ? "/admin" : "/dashboard");
      } else {
        setError(result.error || "Authentification échouée.");
      }
      setLoading(false);
    }, 350);
  };

  const fillAdmin = () => {
    setMode("login");
    setName("Admin");
    setEmail(BRAND.adminEmail);
    setPassword("admin123");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const switchMode = (nextMode: "login" | "register" | "reset") => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
    setResetCode("");
    setResetSent(false);
    setResetVerified(false);
  };

  const handleSendResetCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Impossible d’envoyer le code.");
      return;
    }
    setResetSent(true);
    setResetVerified(false);
    setSuccess(`Code de vérification envoyé à ${email}. Vérifiez votre boîte email.`);
  };

  const handleVerifyResetCode = () => {
    setError("");
    setSuccess("");
    if (!resetSent) {
      setError("Envoyez d’abord le code de vérification.");
      return;
    }
    const result = verifyResetCode(email, resetCode);
    if (!result.ok) {
      setError(result.error || "Code de vérification incorrect.");
      setResetVerified(false);
      return;
    }
    setResetVerified(true);
    setSuccess("Code vérifié. Entrez votre nouveau mot de passe.");
  };

  return (
    <div className="min-h-[90vh] px-4 py-12">
      <div className="container grid max-w-5xl grid-cols-1 overflow-hidden rounded-lg border border-border/70 bg-white shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground md:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(222_39%_11%)_0%,hsl(221_83%_35%)_100%)]" />
          <div className="absolute inset-0 opacity-40 [background:linear-gradient(115deg,transparent_0_44%,hsl(0_0%_100%/0.16)_44%_46%,transparent_46%_100%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-8 inline-flex items-center gap-2">
                <div className="rounded-lg bg-accent p-2.5 text-accent-foreground">
                  <BrandLogo className="h-7 w-7" />
                </div>
                <span className="text-2xl font-extrabold">{BRAND.shortName}<span className="text-accent"> Pro</span></span>
              </div>
              <h1 className="max-w-sm text-4xl font-extrabold leading-tight">Votre espace client, simple et sécurisé.</h1>
              <p className="mt-5 max-w-sm text-primary-foreground/68">Réservations, paiements par carte et factures PDF réunis dans un seul espace.</p>
            </div>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: "Accès protégé par e-mail et mot de passe" },
                { icon: LockKeyhole, text: "Réinitialisation avec code de vérification" },
                { icon: CheckCircle2, text: "Cartes séparées pour chaque client" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-bold text-primary-foreground/82">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 md:hidden">
              <div className="bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--accent))_100%)] p-3 text-primary-foreground rounded-lg shadow-md">
                <BrandLogo className="h-7 w-7" />
              </div>
              <span className="text-2xl font-extrabold">{BRAND.shortName}<span className="text-accent"> Pro</span></span>
            </div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-widest text-accent">
              {mode === "login" ? "Connexion client" : mode === "register" ? "Nouveau client" : "Sécurité du compte"}
            </p>
            <h1 className="text-3xl font-extrabold text-foreground">
              {mode === "login" ? "Bon retour" : mode === "register" ? "Créer un compte" : "Réinitialiser le mot de passe"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === "login"
                ? "Accédez à vos réservations, paiements et factures."
                : mode === "register"
                  ? "Créez votre espace client en quelques secondes."
                  : "Recevez un code par e-mail, puis choisissez un nouveau mot de passe."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-full border border-border bg-muted/70 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition-all ${mode === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition-all ${mode === "register" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  className="ed-input"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {mode === "login" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nom
                </label>
                <input
                  type="text"
                  className="ed-input"
                  placeholder="Optionnel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                className="ed-input"
                placeholder="amine@exemple.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="ed-input pr-12"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "reset" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Code de vérification
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className="ed-input"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                  />
                  <button type="button" onClick={handleSendResetCode} className="ed-secondary-action shrink-0 px-4 py-2 text-sm">
                    {resetSent ? "Renvoyer" : "Envoyer"}
                  </button>
                </div>
                {resetSent && (
                  <button type="button" onClick={handleVerifyResetCode} className="mt-3 ed-primary-action w-full px-4 py-3 text-sm">
                    Vérifier le code
                  </button>
                )}
              </div>
            )}

            {mode === "reset" && resetVerified && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="ed-input pr-12"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "reset" && resetVerified && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="ed-input"
                  placeholder="Retapez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-primary"
              >
                <KeyRound className="h-4 w-4" /> Mot de passe oublié ?
              </button>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            {(mode !== "reset" || resetVerified) && (
              <button
                type="submit"
                disabled={loading}
                className="ed-primary-action w-full py-4 text-base disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : mode === "login" ? (
                  <LogIn className="h-5 w-5" />
                ) : mode === "register" ? (
                  <UserPlus className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                {mode === "login" ? "Se connecter" : mode === "register" ? "Créer mon compte" : "Réinitialiser"}
              </button>
            )}
          </form>

          {mode === "reset" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="mt-4 w-full text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              Retour à la connexion
            </button>
          )}

          {mode !== "reset" && (
            <div className="mt-6 border-t pt-6">
              <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
                Compte administrateur de démonstration
              </p>
              <button
                type="button"
                onClick={fillAdmin}
                className="w-full rounded-lg border border-dashed py-2.5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent"
              >
                Remplir les identifiants admin
              </button>
            </div>
          )}
        </div>

      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Les comptes sont sauvegardés localement dans ce navigateur.
      </p>
    </div>
  );
}
