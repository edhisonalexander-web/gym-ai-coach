import { createFileRoute, Link, Navigate as Redirect, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending) return <main className="min-h-dvh bg-background" />;
  if (user) return <Redirect to="/" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Atleta",
        });
        if (error) throw new Error(error.message ?? "No se pudo crear la cuenta");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "No se pudo entrar");
      }
      await authClient.getSession();
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de acceso");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10">
      <Wordmark />
      <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">
        {mode === "in" ? "Entra a entrenar" : "Crea tu cuenta"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google, X o correo. Apple Sign In no está disponible en esta versión web.
      </p>

      {authEnabled ? (
        <div className="mt-8 space-y-3">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
            >
              Continuar con {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">El acceso está desactivado.</p>
      )}

      <div className="my-8 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        correo
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={(e) => void onEmail(e)} className="space-y-4">
        {mode === "up" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={busy || !authEnabled}>
          {busy ? "Un momento…" : mode === "in" ? "Entrar" : "Crear cuenta"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-6 text-sm text-muted-foreground"
        onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
      >
        {mode === "in" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
      </button>

      <Link to="/" className="mt-auto pt-10 text-center text-xs text-muted-foreground">
        Volver
      </Link>
    </main>
  );
}
