import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listWorkouts } from "@/lib/server/workouts";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  return (
    <AppShell>
      <History />
    </AppShell>
  );
}

function History() {
  const q = useQuery({ queryKey: ["workouts"], queryFn: () => listWorkouts() });
  const groups = groupByDay(q.data ?? []);

  return (
    <main className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Historial</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cada sesión guardada, con técnica y volumen.</p>
      {q.isPending ? (
        <div className="mt-6 space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Todavía no hay sesiones.{" "}
          <Link to="/coach" className="text-primary">
            Empieza una
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{g.label}</h2>
              <ul className="mt-2 space-y-2">
                {g.items.map((w) => (
                  <li key={w.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{w.exerciseName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {w.reps} reps · {formatDuration(w.durationSec)} · {w.calories} kcal
                        </p>
                      </div>
                      <p className="font-display text-lg font-semibold tabular">{w.formScore}</p>
                    </div>
                    {w.issues.length > 0 && (
                      <p className="mt-2 text-xs text-warn">{w.issues[0]}</p>
                    )}
                    {w.muscles.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">{w.muscles.slice(0, 4).join(" · ")}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function groupByDay(items: Awaited<ReturnType<typeof listWorkouts>>) {
  const map = new Map<string, typeof items>();
  for (const w of items) {
    const day = String(w.startedAt).slice(0, 10);
    const arr = map.get(day) ?? [];
    arr.push(w);
    map.set(day, arr);
  }
  return [...map.entries()].map(([day, list]) => ({
    day,
    label: formatDay(day),
    items: list,
  }));
}

function formatDay(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}
