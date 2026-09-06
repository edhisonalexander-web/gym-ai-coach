import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { GuestOrApp } from "@/components/layout/guest-or-app";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { EXERCISES } from "@/lib/exercises/catalog";
import { getTodaySessionCount } from "@/lib/server/workouts";

export const Route = createFileRoute("/coach/")({ component: CoachPage });

function CoachPage() {
  return (
    <GuestOrApp>
      <CoachPicker />
    </GuestOrApp>
  );
}

function CoachPicker() {
  const { user } = useCurrentUserState();
  const quota = useQuery({
    queryKey: ["quota"],
    queryFn: () => getTodaySessionCount(),
    enabled: Boolean(user),
  });
  const live = EXERCISES.filter((e) => e.live);
  const rest = EXERCISES.filter((e) => !e.live);

  return (
    <main className="mx-auto max-w-lg px-5 pt-6 pb-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Coach</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Elige el movimiento. La cámara cuenta reps y señala la técnica.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {!user
          ? "Prueba el modo demostración sin cuenta. Para guardar, entra."
          : quota.data?.isPremium
            ? "Premium · sesiones ilimitadas"
            : `${quota.data?.remaining ?? "—"} sesiones gratis restantes hoy`}
      </p>

      <h2 className="mt-8 text-sm font-medium">Con detector en vivo</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2">
        {live.map((e) => (
          <li key={e.slug}>
            <Link
              to="/coach/$slug"
              params={{ slug: e.slug }}
              className="flex min-h-14 items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <div>
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.musclesWorking.slice(0, 3).join(" · ")}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Camera className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-sm font-medium">Guía (sin detector específico)</h2>
      <ul className="mt-3 space-y-2">
        {rest.map((e) => (
          <li key={e.slug}>
            <Link
              to="/library/$slug"
              params={{ slug: e.slug }}
              className="flex min-h-14 items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <p className="text-sm font-medium">{e.name}</p>
              <Badge variant="secondary">Guía</Badge>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
