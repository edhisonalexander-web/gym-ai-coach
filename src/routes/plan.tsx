import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePlan, listPlans } from "@/lib/server/plans";
import { getProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  return (
    <AppShell>
      <Plan />
    </AppShell>
  );
}

function Plan() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => listPlans() });
  const gen = useMutation({
    mutationFn: () => generatePlan(),
    onSuccess: (res) => {
      if (!res.ok) {
        if (res.error === "premium") {
          toast.error("El plan gratuito incluye un programa. Pasa a Premium para generar más.");
        } else if (res.error === "profile") {
          toast.error("Completa tu perfil primero.");
        } else {
          toast.error("No se pudo generar el plan");
        }
        return;
      }
      toast.success("Plan listo");
      void qc.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: () => toast.error("No se pudo generar el plan"),
  });

  const current = plans.data?.[0];
  const locked = !profile.data?.isPremium && (plans.data?.length ?? 0) >= 1;

  return (
    <main className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Plan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Un programa semanal según tu objetivo, nivel y material. Generado por IA, con un respaldo local si el modelo no está disponible.
      </p>

      <Button
        className="mt-6 w-full"
        size="lg"
        disabled={gen.isPending || locked}
        onClick={() => gen.mutate()}
      >
        {gen.isPending ? "Diseñando la semana…" : current ? "Generar otro plan" : "Generar plan con IA"}
      </Button>
      {locked && (
        <p className="mt-2 text-xs text-warn">
          Límite del plan gratuito.{" "}
          <Link to="/premium" className="text-primary">
            Premium
          </Link>
        </p>
      )}

      {plans.isPending ? (
        <Skeleton className="mt-8 h-40 w-full rounded-xl" />
      ) : current ? (
        <article className="mt-8">
          <h2 className="font-display text-xl font-semibold">{current.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.summary}</p>
          <div className="mt-6 space-y-4">
            {current.days.map((d) => (
              <section key={d.day} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                <p className="text-xs font-medium tracking-wide text-primary uppercase">{d.day}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{d.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {d.focus} · {d.durationMin} min
                </p>
                <ul className="mt-3 space-y-2">
                  {d.exercises.map((ex) => (
                    <li key={ex.slug + ex.name} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        {ex.slug ? (
                          <Link to="/library/$slug" params={{ slug: ex.slug }} className="font-medium">
                            {ex.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{ex.name}</span>
                        )}
                        {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                      </div>
                      <span className="shrink-0 text-xs tabular text-muted-foreground">
                        {ex.sets} × {ex.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">Todavía no hay un plan. Genera el primero cuando quieras.</p>
      )}
    </main>
  );
}
