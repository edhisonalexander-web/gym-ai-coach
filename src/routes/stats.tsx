import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getStats } from "@/lib/server/workouts";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  return (
    <AppShell>
      <Stats />
    </AppShell>
  );
}

function Stats() {
  const q = useQuery({ queryKey: ["stats"], queryFn: () => getStats() });
  const data = q.data;

  return (
    <main className="mx-auto max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Progreso</h1>
      <p className="mt-1 text-sm text-muted-foreground">Volumen, técnica y músculos de las últimas sesiones.</p>

      {q.isPending ? (
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Tile label="Sesiones" value={String(data?.sessions ?? 0)} />
            <Tile label="Repeticiones" value={String(data?.reps ?? 0)} />
            <Tile label="Tiempo" value={formatDuration(data?.seconds ?? 0)} />
            <Tile label="Kcal" value={String(data?.calories ?? 0)} />
          </div>
          <div className="mt-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-xs text-muted-foreground">Técnica media</p>
            <p className="font-display text-3xl font-semibold tabular">{data?.avgScore ?? 0}</p>
          </div>

          <h2 className="mt-8 text-sm font-medium">Reps · 14 días</h2>
          <div className="mt-3 h-48 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
            {(data?.weekly.length ?? 0) === 0 ? (
              <p className="grid h-full place-items-center text-sm text-muted-foreground">Aún no hay datos</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data!.weekly}>
                  <CartesianGrid stroke="rgba(238,243,241,0.06)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#8b9692", fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis tick={{ fill: "#8b9692", fontSize: 10 }} width={28} />
                  <Tooltip
                    contentStyle={{ background: "#101416", border: "1px solid #1e2628", borderRadius: 12 }}
                    labelStyle={{ color: "#eef3f1" }}
                  />
                  <Bar dataKey="reps" fill="#3ee0c5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <h2 className="mt-8 text-sm font-medium">Músculos trabajados</h2>
          <ul className="mt-3 space-y-2">
            {(data?.muscles ?? []).map((m) => (
              <li key={m.name} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
                <span>{m.name}</span>
                <span className="tabular text-muted-foreground">{m.value} reps</span>
              </li>
            ))}
            {(data?.muscles.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Entrena para ver el mapa muscular.</p>
            )}
          </ul>
          <Link to="/history" className="mt-6 inline-block text-sm text-primary">
            Ver historial
          </Link>
        </>
      )}
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular">{value}</p>
    </div>
  );
}
