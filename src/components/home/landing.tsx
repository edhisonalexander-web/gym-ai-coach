import { Link } from "@tanstack/react-router";
import { Camera, ChartLine, Shield, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { EXERCISES } from "@/lib/exercises/catalog";

const FEATURES = [
  {
    icon: Camera,
    title: "Técnica en vivo",
    body: "La cámara lee tu postura, cuenta repeticiones y señala el error en el momento.",
  },
  {
    icon: Shield,
    title: "Menos lesiones",
    body: "Cada fallo viene con la corrección y el riesgo: rodilla, hombro, lumbar.",
  },
  {
    icon: Sparkles,
    title: "Plan con IA",
    body: "Un programa semanal según tu objetivo, equipo y nivel. No una plantilla genérica.",
  },
  {
    icon: ChartLine,
    title: "Progreso real",
    body: "Historial, racha y gráficos de volumen y técnica. Lo que no se mide no mejora.",
  },
];

export function Landing() {
  const live = EXERCISES.filter((e) => e.live).slice(0, 6);

  return (
    <div className="min-h-dvh bg-background pb-16">
      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Wordmark />
        <Button asChild size="sm" variant="secondary">
          <Link to="/login">Entrar</Link>
        </Button>
      </header>

      <section className="stagger-in px-5 pt-10">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Coach de IA en el bolsillo</p>
        <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
          Entrena con un ojo que ve tu técnica.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Gym AI Coach reconoce sentadillas, flexiones, planchas y más. Cuenta reps, corrige la postura y te
          dice qué músculos están trabajando.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/coach/$slug" params={{ slug: "sentadilla" }}>
              Probar sentadilla
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/library">Ver ejercicios</Link>
          </Button>
        </div>
      </section>

      <section className="mx-5 mt-10 overflow-hidden rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <PhoneMock />
      </section>

      <section className="mt-12 grid gap-3 px-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <article key={f.title} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <f.icon className="size-5 text-primary" strokeWidth={1.75} />
            <h2 className="mt-3 font-display text-lg font-semibold">{f.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 px-5">
        <h2 className="font-display text-2xl font-semibold">Análisis en vivo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Estos movimientos tienen detector de postura ahora mismo.</p>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {live.map((e) => (
            <li key={e.slug}>
              <Link
                to="/coach/$slug"
                params={{ slug: e.slug }}
                className="block rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
              >
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.musclesWorking[0]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-5 mt-12 rounded-2xl bg-secondary p-6">
        <h2 className="font-display text-2xl font-semibold">Gratis para empezar. Premium cuando lo uses en serio.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tres sesiones de cámara al día y un plan de IA en el plan gratuito. Ilimitado, historial avanzado y
          planes semanales en Premium.
        </p>
        <Button asChild className="mt-5" size="lg">
          <Link to="/login">Crear cuenta</Link>
        </Button>
      </section>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto aspect-[9/14] max-h-[420px] max-w-[240px] overflow-hidden rounded-[28px] bg-ink shadow-[var(--shadow-border)]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 text-xs text-muted-foreground">
        <span>Sentadilla</span>
        <span className="tabular">0:24</span>
      </div>
      <svg viewBox="0 0 200 320" className="absolute inset-0 h-full w-full text-primary" aria-hidden>
        <line x1="40" y1="70" x2="100" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="160" y1="70" x2="100" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="70" x2="32" y2="120" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="160" y1="70" x2="168" y2="120" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="90" x2="100" y2="160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="160" x2="70" y2="230" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="160" x2="130" y2="230" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="70" y1="230" x2="62" y2="290" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="230" x2="138" y2="290" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="58" r="10" fill="currentColor" />
      </svg>
      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-background/80 p-3 backdrop-blur-sm">
        <div className="flex items-end justify-between">
          <p className="font-display text-3xl font-semibold tabular leading-none">8</p>
          <p className="text-xs text-muted-foreground">técnica 91</p>
        </div>
        <p className="mt-2 text-xs leading-snug">Empuja las rodillas en la dirección de los pies.</p>
      </div>
    </div>
  );
}
