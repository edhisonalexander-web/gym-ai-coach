import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExercise } from "@/lib/exercises/catalog";
import { GROUP_LABEL } from "@/lib/exercises/types";

export const Route = createFileRoute("/library/$slug")({
  component: ExercisePage,
  loader: ({ params }) => {
    const ex = getExercise(params.slug);
    if (!ex) throw notFound();
    return ex;
  },
});

function ExercisePage() {
  const ex = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-lg px-5 pt-6 pb-28">
      <Link to="/library" className="inline-flex h-11 items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" />
        Biblioteca
      </Link>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{GROUP_LABEL[ex.group]}</Badge>
        <Badge variant="secondary">{ex.level}</Badge>
        <Badge variant="secondary">{ex.equipment}</Badge>
        {ex.live && <Badge>Análisis en vivo</Badge>}
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{ex.name}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ex.summary}</p>

      <h2 className="mt-8 text-sm font-medium">Músculos que trabajan</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ex.musclesWorking.map((m) => (
          <Badge key={m} variant="default">
            {m}
          </Badge>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-medium">Preparación</h2>
      <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
        {ex.setup.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="tabular text-primary">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <h2 className="mt-8 text-sm font-medium">Cues</h2>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        {ex.cues.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h2 className="mt-8 text-sm font-medium">Errores y corrección</h2>
      <ul className="mt-2 space-y-3">
        {ex.commonErrors.map((err) => (
          <li key={err.error} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-sm font-medium">{err.error}</p>
            <p className="mt-1 text-sm text-muted-foreground">{err.fix}</p>
            <p className="mt-2 text-xs text-warn">Riesgo: {err.risk}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-sm font-medium">Zonas de riesgo</h2>
      <p className="mt-1 text-sm text-muted-foreground">{ex.injuryRisks.join(" · ")}</p>

      <Button asChild size="lg" className="mt-8 w-full">
        <Link to="/coach/$slug" params={{ slug: ex.slug }}>
          <Camera className="size-4" />
          Analizar con la cámara
        </Link>
      </Button>
    </main>
  );
}
