import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EXERCISES } from "@/lib/exercises/catalog";
import { GROUP_LABEL, GROUP_ORDER, type MuscleGroup } from "@/lib/exercises/types";

export const Route = createFileRoute("/library/")({ component: Library });

function Library() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "all">("all");
  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      const inGroup = group === "all" || e.group === group || e.secondary.includes(group);
      const inQ =
        !query ||
        e.name.toLowerCase().includes(query) ||
        e.musclesWorking.some((m) => m.toLowerCase().includes(query));
      return inGroup && inQ;
    });
  }, [q, group]);

  return (
    <main className="mx-auto max-w-lg px-5 pt-6 pb-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Biblioteca</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {EXERCISES.length} ejercicios · {EXERCISES.filter((e) => e.live).length} con análisis en vivo
      </p>
      <Input
        className="mt-5"
        placeholder="Buscar sentadilla, pecho, core…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip active={group === "all"} onClick={() => setGroup("all")}>
          Todos
        </Chip>
        {GROUP_ORDER.map((g) => (
          <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
            {GROUP_LABEL[g]}
          </Chip>
        ))}
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((e) => (
          <li key={e.slug}>
            <Link
              to="/library/$slug"
              params={{ slug: e.slug }}
              className="flex items-start justify-between gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <div>
                <p className="text-sm font-medium">{e.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{GROUP_LABEL[e.group]}</Badge>
                  {e.live && <Badge>En vivo</Badge>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-11 shrink-0 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground"
          : "h-11 shrink-0 rounded-full bg-secondary px-3 text-xs font-medium text-muted-foreground"
      }
    >
      {children}
    </button>
  );
}
