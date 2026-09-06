import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getProfile, setPremium } from "@/lib/server/profile";

export const Route = createFileRoute("/premium")({ component: PremiumPage });

const FREE = ["3 sesiones de cámara al día", "Biblioteca completa", "1 plan de IA", "Historial básico"];
const PRO = [
  "Sesiones de cámara ilimitadas",
  "Planes semanales ilimitados",
  "Estadísticas avanzadas",
  "Cues de voz y correcciones",
  "Prioridad en nuevas detecciones",
];

function PremiumPage() {
  return (
    <AppShell>
      <Premium />
    </AppShell>
  );
}

function Premium() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const mut = useMutation({
    mutationFn: (on: boolean) => setPremium({ data: on }),
    onSuccess: (res) => {
      toast.success(res.isPremium ? "Premium activado" : "Has vuelto al plan gratuito");
      void qc.invalidateQueries({ queryKey: ["profile"] });
      void qc.invalidateQueries({ queryKey: ["quota"] });
    },
    onError: () => toast.error("No se pudo actualizar la suscripción"),
  });

  const on = Boolean(profile.data?.isPremium);

  return (
    <main className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">Suscripción</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Entrena sin techo diario</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        El cobro real de App Store y Google Play se conecta al publicar la app nativa. Aquí puedes activar Premium en tu cuenta para probar todas las funciones.
      </p>

      <div className="mt-8 grid gap-3">
        <article className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-lg font-semibold">Gratis</h2>
          <p className="text-sm text-muted-foreground">Para probar el coach</p>
          <ul className="mt-4 space-y-2 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {f}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-lg font-semibold">Premium</h2>
          <p className="text-sm text-muted-foreground">9,99 € / mes · o 79 € / año</p>
          <ul className="mt-4 space-y-2 text-sm">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="mt-5 w-full"
            size="lg"
            variant={on ? "secondary" : "default"}
            disabled={mut.isPending}
            onClick={() => mut.mutate(!on)}
          >
            {on ? "Cancelar Premium" : "Activar Premium"}
          </Button>
        </article>
      </div>
    </main>
  );
}
