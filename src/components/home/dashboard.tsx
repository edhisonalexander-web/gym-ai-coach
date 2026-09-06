import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Crown, Dumbbell } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EXERCISES } from "@/lib/exercises/catalog";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getProfile } from "@/lib/server/profile";
import { listPlans } from "@/lib/server/plans";
import { getStats, getTodaySessionCount, listWorkouts } from "@/lib/server/workouts";
import { formatDuration } from "@/lib/utils";

export function Dashboard() {
  const user = useCurrentUser();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const quota = useQuery({ queryKey: ["quota"], queryFn: () => getTodaySessionCount() });
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => getStats() });
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: () => listWorkouts() });
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => listPlans() });

  const name = profile.data?.displayName || user?.displayName || "atleta";
  const first = name.split(" ")[0];
  const live = EXERCISES.filter((e) => e.live).slice(0, 4);
  const recent = workouts.data?.slice(0, 3) ?? [];
  const plan = plans.data?.[0];

  return (
    <div className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <header className="flex items-center justify-between">
        <Wordmark />
        {!profile.data?.isPremium && (
          <Link to="/premium" className="flex items-center gap-1 text-xs font-medium text-primary">
            <Crown className="size-3.5" />
            Premium
          </Link>
        )}
      </header>

      <section className="stagger-in mt-8">
        <p className="text-sm text-muted-foreground">Hola, {first}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">¿Entrenamos ahora?</h1>
      </section>

      <Card className="mt-6 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">Sesión con cámara</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {quota.data?.isPremium
                ? "Sesiones ilimitadas hoy"
                : `${quota.data?.remaining ?? "—"} de ${quota.data?.limit ?? 3} sesiones gratis hoy`}
            </p>
          </div>
          <Camera className="size-5 text-primary" />
        </div>
        <Button asChild className="mt-4 w-full" size="lg">
          <Link to="/coach">
            Iniciar análisis
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Card>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold">Inicio rápido</h2>
          <Link to="/library" className="text-xs text-muted-foreground">
            Biblioteca
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {live.map((e) => (
            <Link
              key={e.slug}
              to="/coach/$slug"
              params={{ slug: e.slug }}
              className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <p className="text-sm font-medium">{e.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{e.musclesWorking[0]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold">Tu plan</h2>
          <Link to="/plan" className="text-xs text-muted-foreground">
            Ver
          </Link>
        </div>
        {plans.isPending ? (
          <Skeleton className="mt-3 h-24 w-full rounded-xl" />
        ) : plan ? (
          <Link to="/plan" className="mt-3 block rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-sm font-medium">{plan.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{plan.days.length} días · {plan.summary}</p>
          </Link>
        ) : (
          <Card className="mt-3 p-4">
            <p className="text-sm text-muted-foreground">Todavía no tienes un plan semanal.</p>
            <Button asChild variant="secondary" className="mt-3" size="sm">
              <Link to="/plan">Generar con IA</Link>
            </Button>
          </Card>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Esta semana</h2>
        {stats.isPending ? (
          <Skeleton className="mt-3 h-20 w-full rounded-xl" />
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Mini label="Sesiones" value={String(stats.data?.sessions ?? 0)} />
            <Mini label="Reps" value={String(stats.data?.reps ?? 0)} />
            <Mini label="Técnica" value={String(stats.data?.avgScore ?? 0)} />
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold">Últimas sesiones</h2>
          <Link to="/history" className="text-xs text-muted-foreground">
            Historial
          </Link>
        </div>
        {workouts.isPending ? (
          <Skeleton className="mt-3 h-24 w-full rounded-xl" />
        ) : recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aún no hay entrenamientos. La primera sesión cuenta.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <div className="flex items-center gap-3">
                  <Dumbbell className="size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{w.exerciseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.reps} reps · {formatDuration(w.durationSec)}
                    </p>
                  </div>
                </div>
                <p className="text-sm tabular text-muted-foreground">{w.formScore}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular">{value}</p>
    </div>
  );
}
