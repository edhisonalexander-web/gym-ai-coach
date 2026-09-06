import { Link, useNavigate } from "@tanstack/react-router";
import { Camera, Check, FlipHorizontal, Pause, Play, Sparkles, Square, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Exercise } from "@/lib/exercises/types";
import { createDetector } from "@/lib/pose/detectors";
import { demoPose } from "@/lib/pose/demo-skeleton";
import { drawPose, drawStudioBackdrop } from "@/lib/pose/draw";
import { landmarksFromResult, loadPoseLandmarker } from "@/lib/pose/mediapipe";
import type { DetectorOutput, Landmark } from "@/lib/pose/types";
import { saveWorkout } from "@/lib/server/workouts";
import { formatDuration } from "@/lib/utils";

type Mode = "idle" | "running" | "summary";
type Source = "camera" | "demo";
type Facing = "user" | "environment";

export function CameraSession({
  exercise,
  weightKg,
  voiceCues,
  canStart,
  signedIn,
}: {
  exercise: Exercise;
  weightKg: number | null;
  voiceCues: boolean;
  canStart: boolean;
  signedIn: boolean;
}) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const detectorRef = useRef(createDetector(exercise.detector, exercise.musclesWorking));
  const startTs = useRef(0);
  const lastSpeak = useRef(0);
  const lastCue = useRef("");
  const voiceRef = useRef(voiceCues);
  const acc = useRef({ score: 0, n: 0, issues: new Set<string>(), muscles: new Set<string>() });
  const pausedRef = useRef(false);
  const facingRef = useRef<Facing>("user");
  const landmarkerRef = useRef<Awaited<ReturnType<typeof loadPoseLandmarker>>>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [source, setSource] = useState<Source>("demo");
  const [facing, setFacing] = useState<Facing>("user");
  const [voice, setVoice] = useState(voiceCues);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [out, setOut] = useState<DetectorOutput | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    detectorRef.current = createDetector(exercise.detector, exercise.musclesWorking);
  }, [exercise]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function speak(text: string) {
    if (!voiceRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const now = performance.now();
    if (now - lastSpeak.current < 4500) return;
    if (text === lastCue.current) return;
    lastCue.current = text;
    lastSpeak.current = now;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function openCamera(nextFacing: Facing) {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: nextFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    streamRef.current = stream;
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      await video.play();
    }
  }

  async function start(src: Source) {
    if (!canStart) {
      toast.error("Has llegado al límite diario del plan gratuito.");
      navigate({ to: "/premium" });
      return;
    }
    setSource(src);
    setLoading(true);
    setCamError(null);
    detectorRef.current.reset();
    acc.current = { score: 0, n: 0, issues: new Set(), muscles: new Set() };
    startTs.current = performance.now();
    setElapsed(0);
    setPaused(false);

    if (src === "camera") {
      try {
        await openCamera(facing);
        landmarkerRef.current = await loadPoseLandmarker();
      } catch {
        setCamError("No se pudo abrir la cámara. Usa el modo demostración o concede el permiso.");
        setLoading(false);
        return;
      }
    }

    setMode("running");
    setLoading(false);
    loop(src);
  }

  async function flipCam() {
    const next: Facing = facingRef.current === "user" ? "environment" : "user";
    facingRef.current = next;
    setFacing(next);
    try {
      await openCamera(next);
    } catch {
      setCamError("No se pudo cambiar de cámara.");
    }
  }

  function loop(src: Source) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastUi = 0;
    const tick = (now: number) => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const w = canvas.clientWidth || 390;
      const h = canvas.clientHeight || 700;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      let landmarks: Landmark[] | null = null;
      if (src === "demo") {
        drawStudioBackdrop(ctx, w, h);
        landmarks = demoPose(exercise.detector, (now - startTs.current) / 1000);
      } else if (video && video.readyState >= 2) {
        ctx.save();
        if (facingRef.current === "user") {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
        const lm = landmarkerRef.current;
        if (lm) {
          const res = lm.detectForVideo(video, now);
          landmarks = landmarksFromResult(res);
        }
      } else {
        drawStudioBackdrop(ctx, w, h);
      }

      if (landmarks) {
        const result = detectorRef.current.onFrame({ landmarks, timestamp: now });
        acc.current.score += result.formScore;
        acc.current.n += 1;
        result.issues.forEach((i) => acc.current.issues.add(i.message));
        result.muscles.forEach((m) => acc.current.muscles.add(m));
        drawPose(ctx, landmarks, {
          w,
          h,
          mirror: src === "camera" && facingRef.current === "user",
          warn: result.issues.some((i) => i.severity !== "info"),
        });
        if (now - lastUi > 120) {
          lastUi = now;
          setOut(result);
          setElapsed((now - startTs.current) / 1000);
        }
        if (result.issues[0]) speak(result.issues[0].fix);
        else if (result.reps > 0 && result.reps % 5 === 0) speak(`${result.reps} repeticiones`);
      } else if (now - lastUi > 120) {
        lastUi = now;
        setElapsed((now - startTs.current) / 1000);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  async function finish() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setMode("summary");
  }

  async function persist() {
    if (!signedIn) {
      toast.message("Crea una cuenta para guardar la sesión");
      navigate({ to: "/login" });
      return;
    }
    setSaving(true);
    const durationSec = Math.max(1, Math.round(elapsed));
    const reps = out?.reps ?? 0;
    const hold = out?.holdSec ?? 0;
    const formScore = acc.current.n ? Math.round(acc.current.score / acc.current.n) : 0;
    const hours = durationSec / 3600;
    const calories = Math.max(1, Math.round(exercise.met * (weightKg ?? 70) * hours));
    const counted = detectorRef.current.kind === "hold" ? Math.round(hold) : reps;
    try {
      const res = await saveWorkout({
        data: {
          exerciseSlug: exercise.slug,
          exerciseName: exercise.name,
          durationSec,
          reps: counted,
          formScore,
          calories,
          issues: [...acc.current.issues].slice(0, 6),
          muscles: [...acc.current.muscles],
          source,
        },
      });
      if (!res.ok) {
        toast.error("No se pudo guardar. Revisa tu plan o inicia sesión.");
      } else {
        toast.success("Sesión guardada");
        navigate({ to: "/history" });
      }
    } catch {
      toast.error("No se pudo guardar la sesión");
    } finally {
      setSaving(false);
    }
  }

  const reps = out?.reps ?? 0;
  const hold = out?.holdSec ?? 0;
  const score = out?.formScore ?? 0;
  const isHold = detectorRef.current.kind === "hold";
  const headline = isHold ? `${Math.floor(hold)}s` : String(reps);

  return (
    <div className="relative min-h-dvh bg-ink text-foreground">
      <video ref={videoRef} className="pointer-events-none absolute h-0 w-0 opacity-0" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {mode === "idle" && (
        <div className="relative z-10 flex min-h-dvh flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
          <div className="flex items-center justify-between">
            <Link to="/coach" className="grid size-11 place-items-center rounded-full bg-secondary">
              <X className="size-4" />
            </Link>
            <p className="font-display text-sm font-semibold">{exercise.name}</p>
            <span className="w-11" />
          </div>
          <div className="stagger-in mx-auto mt-8 max-w-md flex-1">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">Análisis en tiempo real</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Coloca el teléfono y entra en el encuadre
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{exercise.summary}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {exercise.setup.map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            {camError && <p className="mt-4 text-sm text-destructive">{camError}</p>}
            {!canStart && (
              <p className="mt-4 text-sm text-warn">
                Límite diario del plan gratuito alcanzado. Pasa a Premium para seguir entrenando hoy.
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <Button size="lg" onClick={() => void start("camera")} disabled={loading || !canStart}>
                <Camera className="size-4" />
                {loading ? "Preparando…" : "Abrir cámara"}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => void start("demo")} disabled={loading || !canStart}>
                <Sparkles className="size-4" />
                Modo demostración
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              La demostración anima un esqueleto y corre el mismo motor de repeticiones y técnica. Úsala si la
              cámara no está disponible.
            </p>
          </div>
        </div>
      )}

      {mode === "running" && (
        <div className="relative z-10 flex min-h-dvh flex-col justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => void finish()}
              className="grid size-11 place-items-center rounded-full bg-ink/55 backdrop-blur-sm"
            >
              <X className="size-4" />
            </button>
            <div className="rounded-full bg-ink/55 px-3 py-1.5 text-xs font-medium tabular backdrop-blur-sm">
              {formatDuration(elapsed)}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setVoice((v) => !v)}
                className="grid size-11 place-items-center rounded-full bg-ink/55 backdrop-blur-sm"
                aria-label={voice ? "Silenciar" : "Activar voz"}
              >
                {voice ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>
              {source === "camera" && (
                <button
                  type="button"
                  onClick={() => void flipCam()}
                  className="grid size-11 place-items-center rounded-full bg-ink/55 backdrop-blur-sm"
                  aria-label="Cambiar cámara"
                >
                  <FlipHorizontal className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="pointer-events-none flex flex-col items-center">
            <p className="text-xs font-medium tracking-widest text-primary uppercase">{exercise.name}</p>
            <p className="font-display text-7xl font-semibold tabular leading-none tracking-tight">{headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">{isHold ? "segundos en posición" : "repeticiones"}</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-ink/60 p-4 shadow-[var(--shadow-border)] backdrop-blur-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Técnica</span>
                <span className="tabular font-medium">{score}</span>
              </div>
              <Progress value={score} className="mt-2" />
              <p className="mt-3 text-sm leading-snug">{out?.cue ?? "Buscando postura…"}</p>
              {out?.issues[0] && <p className="mt-2 text-xs text-warn">Riesgo: {out.issues[0].risk}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(out?.muscles ?? exercise.musclesWorking).slice(0, 4).map((m) => (
                  <span key={m} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setPaused((p) => !p)}>
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                {paused ? "Seguir" : "Pausa"}
              </Button>
              <Button className="flex-1" onClick={() => void finish()}>
                <Square className="size-4" />
                Terminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {mode === "summary" && (
        <div className="relative z-10 flex min-h-dvh flex-col bg-background px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">Sesión completada</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{exercise.name}</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label={isHold ? "Tiempo" : "Reps"} value={isHold ? `${Math.floor(hold)}s` : String(reps)} />
            <Stat label="Duración" value={formatDuration(elapsed)} />
            <Stat
              label="Técnica"
              value={String(acc.current.n ? Math.round(acc.current.score / acc.current.n) : 0)}
            />
            <Stat
              label="Kcal"
              value={String(Math.max(1, Math.round(exercise.met * (weightKg ?? 70) * (elapsed / 3600))))}
            />
          </div>
          {acc.current.issues.size > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium">Correcciones</h2>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {[...acc.current.issues].slice(0, 4).map((i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Button size="lg" onClick={() => void persist()} disabled={saving}>
              {saving ? "Guardando…" : signedIn ? "Guardar en el historial" : "Crear cuenta y guardar"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setMode("idle");
                setOut(null);
              }}
            >
              Repetir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular">{value}</p>
    </div>
  );
}
