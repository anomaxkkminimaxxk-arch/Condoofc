import { useState } from "react";
  import { ShieldAlert, ShieldCheck, ShieldX, Loader2, Eye, EyeOff, User, Lock } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";

  interface RobloxProfile {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    ageDays: number;
    created: string;
    description: string;
  }

  type Step = "username" | "profile" | "success";

  export function VerificationGate({ onVerified }: { onVerified: () => void }) {
    const [step, setStep] = useState<Step>("username");
    const [username, setUsername] = useState("");
    const [sitePassword, setSitePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [profile, setProfile] = useState<RobloxProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const checkUsername = async () => {
      if (!username.trim()) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/verify/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erro ao verificar conta.");
        } else {
          setProfile(data);
          setStep("profile");
        }
      } catch {
        setError("Erro de conexao. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    const register = async () => {
      if (!sitePassword.trim() || !profile) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/verify/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            robloxId: profile.id,
            robloxUsername: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            ageDays: profile.ageDays,
            created: profile.created,
            sitePassword,
          }),
        });
        if (res.ok) {
          setStep("success");
          setTimeout(() => {
            localStorage.setItem("cu_verified", "1");
            onVerified();
          }, 2000);
        } else {
          const data = await res.json();
          setError(data.error ?? "Erro ao finalizar. Tente novamente.");
        }
      } catch {
        setError("Erro de conexao. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[999] bg-background flex items-center justify-center overflow-y-auto py-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <ShieldAlert className="w-8 h-8 text-primary" style={{filter: "drop-shadow(0 0 8px #e31221)"}} />
              <span className="font-display font-black text-2xl text-primary tracking-widest" style={{textShadow: "0 0 20px rgba(227,18,33,0.5)"}}>
                CONDO UNIVERSE
              </span>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-4" />
            <p className="text-muted-foreground font-display tracking-widest text-xs uppercase">
              Verificacao de Acesso
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {(["username", "profile"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={"w-8 h-8 rounded-full border-2 flex items-center justify-center font-display text-sm font-bold transition-all " + (
                  step === s ? "border-primary bg-primary/20 text-primary" :
                  (step === "profile" && s === "username") || step === "success"
                    ? "border-primary/60 bg-primary/10 text-primary/60"
                    : "border-primary/20 bg-transparent text-muted-foreground"
                )}>
                  {((step === "profile" && s === "username") || step === "success") && i === 0 ? "checkmark" : i + 1}
                </div>
                {i === 0 && <div className={"w-12 h-px " + (step !== "username" ? "bg-primary/40" : "bg-primary/10")} />}
              </div>
            ))}
          </div>

          <div className="bg-card border border-primary/30 rounded-xl p-8" style={{boxShadow: "0 0 40px rgba(227,18,33,0.1)"}}>

            {step === "username" && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-12 h-12 text-primary mx-auto mb-3" style={{filter: "drop-shadow(0 0 6px #e31221)"}} />
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Verificar Conta Roblox</h2>
                  <p className="text-muted-foreground text-sm">
                    Digite seu nome de usuario do Roblox para verificar se voce tem acesso.
                  </p>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Seu username do Roblox..."
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && checkUsername()}
                    className="bg-background border-primary/30 focus-visible:ring-primary font-mono text-base h-12"
                    disabled={loading}
                  />

                  {error && (
                    <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <ShieldX className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground text-center font-display tracking-wide">
                      Sua conta deve ter no minimo <span className="text-primary font-bold">70 dias</span> de existencia para ter acesso.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={checkUsername}
                  disabled={loading || !username.trim()}
                  className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-display tracking-widest text-base"
                  style={{boxShadow: loading ? "none" : "0 0 20px rgba(227,18,33,0.4)"}}
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> VERIFICANDO...</span>
                  ) : (
                    "VERIFICAR CONTA"
                  )}
                </Button>
              </div>
            )}

            {step === "profile" && profile && (
              <div className="space-y-6">
                <div className="bg-background border border-primary/20 rounded-xl p-5 flex items-center gap-4">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.username}
                      className="w-16 h-16 rounded-full border-2 border-primary"
                      style={{boxShadow: "0 0 12px rgba(227,18,33,0.4)"}}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-primary text-xs font-display tracking-widest uppercase">Verificado</span>
                    </div>
                    <p className="font-display font-bold text-lg text-foreground truncate">{profile.username}</p>
                    {profile.displayName !== profile.username && (
                      <p className="text-muted-foreground text-sm truncate">{profile.displayName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-display px-2 py-0.5 rounded-full border border-primary/30">
                        {profile.ageDays} dias de conta
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-display text-foreground mb-2 tracking-wider uppercase">
                      Senha do Site
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha para o site..."
                        value={sitePassword}
                        onChange={(e) => { setSitePassword(e.target.value); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && register()}
                        className="bg-background border-primary/30 focus-visible:ring-primary font-mono h-12 pl-10 pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-amber-400 text-xs font-display font-bold tracking-wider uppercase">Atencao — Leia antes de criar sua senha</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Esta e a <span className="text-foreground font-bold">senha do Condo Universe</span>,
                      e nao e a senha da sua conta Roblox. Crie uma senha unica e exclusiva
                      para este site. <span className="text-foreground font-semibold">Nunca coloque aqui a mesma senha do seu Roblox.</span>
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <ShieldX className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("username"); setError(""); }}
                    className="border-primary/30 text-muted-foreground hover:text-primary"
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={register}
                    disabled={loading || sitePassword.trim().length < 4}
                    className="flex-1 h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-display tracking-widest"
                    style={{boxShadow: "0 0 20px rgba(227,18,33,0.4)"}}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> ENVIANDO...</span>
                    ) : (
                      "ENTRAR NO SITE"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto"
                  style={{boxShadow: "0 0 20px rgba(227,18,33,0.3)"}}>
                  <ShieldCheck className="w-10 h-10 text-primary" style={{filter: "drop-shadow(0 0 8px #e31221)"}} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black text-primary mb-2" style={{textShadow: "0 0 20px rgba(227,18,33,0.5)"}}>ACESSO LIBERADO</h2>
                  <p className="text-muted-foreground text-sm font-display tracking-widest">
                    Bem-vindo ao Condo Universe, <span className="text-foreground font-bold">{profile?.username}</span>!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Entrando...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
