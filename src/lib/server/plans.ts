import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { EXERCISES } from "@/lib/exercises/catalog";
import type { PlanDay, TrainingPlan } from "./types";

type PlanRow = {
  id: number;
  title: string;
  summary: string;
  days: string;
  created_at: string;
};

function parseDays(raw: string | PlanDay[]): PlanDay[] {
  if (Array.isArray(raw)) return raw;
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as PlanDay[]) : [];
  } catch {
    return [];
  }
}

function mapPlan(row: PlanRow): TrainingPlan {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    days: parseDays(row.days),
    createdAt: row.created_at,
  };
}

export const listPlans = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<PlanRow>`
      select id, title, summary, days, created_at
      from training_plans
      where user_id = ${context.userId}
      order by created_at desc
      limit 8
    `;
    return rows.map(mapPlan);
  });

function localPlan(input: {
  goal: string;
  experience: string;
  daysPerWeek: number;
  equipment: string;
}): TrainingPlan {
  const daysWanted = Math.min(6, Math.max(3, input.daysPerWeek));
  const pool = EXERCISES.filter((e) => {
    if (input.equipment === "peso corporal") return e.equipment === "peso corporal";
    if (input.equipment === "mancuernas") return e.equipment === "peso corporal" || e.equipment === "mancuernas";
    return true;
  });
  const pick = (slugs: string[]) =>
    slugs
      .map((s) => pool.find((e) => e.slug === s) ?? EXERCISES.find((e) => e.slug === s))
      .filter(Boolean)
      .map((e) => ({
        slug: e!.slug,
        name: e!.name,
        sets: input.experience === "principiante" ? "3" : "4",
        reps: e!.detector === "plank" || e!.detector === "wallsit" ? "30–45 s" : "8–12",
        restSec: 75,
        notes: e!.cues[0] ?? "",
      }));

  const templates: PlanDay[] = [
    {
      day: "Día 1",
      title: "Empuje",
      focus: "Pecho, hombros, tríceps",
      durationMin: 40,
      exercises: pick(["flexiones", "press-militar", "fondos", "elevaciones-laterales", "plancha"]),
    },
    {
      day: "Día 2",
      title: "Tirón",
      focus: "Espalda y bíceps",
      durationMin: 40,
      exercises: pick(["remo-invertido", "curl-biceps", "face-pull", "bird-dog", "plancha-lateral"]),
    },
    {
      day: "Día 3",
      title: "Piernas",
      focus: "Cuádriceps, glúteos, isquios",
      durationMin: 45,
      exercises: pick(["sentadilla", "zancadas", "peso-muerto", "puente-gluteo", "elevacion-gemelos"]),
    },
    {
      day: "Día 4",
      title: "Core y cardio",
      focus: "Estabilidad y condicional",
      durationMin: 30,
      exercises: pick(["dead-bug", "mountain-climbers", "jumping-jacks", "plancha", "hip-thrust"]),
    },
    {
      day: "Día 5",
      title: "Cuerpo completo",
      focus: "Fuerza general",
      durationMin: 40,
      exercises: pick(["sentadilla", "flexiones", "remo-invertido", "press-militar", "crunch"]),
    },
    {
      day: "Día 6",
      title: "Skills",
      focus: "Calistenia y control",
      durationMin: 35,
      exercises: pick(["pike-push-up", "dominadas", "isometrico-core-hollow", "bird-dog", "wall-sit"]),
    },
  ];

  const days = templates.slice(0, daysWanted);
  const goalLabel =
    input.goal === "hipertrofia"
      ? "hipertrofia"
      : input.goal === "grasa"
        ? "composición corporal"
        : input.goal === "calistenia"
          ? "calistenia"
          : "fuerza";
  return {
    id: 0,
    title: `Plan ${daysWanted} días · ${goalLabel}`,
    summary: `Semana estructurada para ${input.experience}, con el material que tienes. Prioriza técnica con la cámara antes de añadir carga.`,
    days,
    createdAt: new Date().toISOString(),
  };
}

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await sql<{
      goal: string | null;
      experience: string | null;
      days_per_week: number;
      equipment: string;
      age: number | null;
      weight_kg: number | null;
      height_cm: number | null;
      is_premium: boolean;
    }>`
      select goal, experience, days_per_week, equipment, age, weight_kg, height_cm, is_premium
      from profiles where user_id = ${context.userId}
    `;
    const p = profile[0];
    if (!p) return { ok: false as const, error: "profile" };

    const existing = await sql<{ n: number }>`
      select count(*)::int as n from training_plans where user_id = ${context.userId}
    `;
    if (!p.is_premium && (existing[0]?.n ?? 0) >= 1) {
      return { ok: false as const, error: "premium" };
    }

    const fallback = localPlan({
      goal: p.goal ?? "fuerza",
      experience: p.experience ?? "principiante",
      daysPerWeek: p.days_per_week,
      equipment: p.equipment,
    });

    let plan = fallback;
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey) {
      try {
        const catalog = EXERCISES.map((e) => e.slug).join(", ");
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 1400,
            temperature: 0.6,
            messages: [
              {
                role: "system",
                content:
                  "Eres un entrenador de fuerza y calistenia. Responde SOLO JSON válido, sin markdown. Esquema: {title, summary, days:[{day,title,focus,durationMin,exercises:[{slug,name,sets,reps,restSec,notes}]}]}. Usa slugs del catálogo. Plan seguro, progresivo, 4–6 ejercicios por día.",
              },
              {
                role: "user",
                content: `Perfil: edad ${p.age ?? 30}, peso ${p.weight_kg ?? 75} kg, altura ${p.height_cm ?? 175} cm, objetivo ${p.goal}, experiencia ${p.experience}, ${p.days_per_week} días/semana, equipo ${p.equipment}. Catálogo: ${catalog}`,
              },
            ],
          }),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices: { message: { content: string } }[] };
          const text = body.choices[0]?.message.content ?? "";
          const jsonText = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(jsonText) as TrainingPlan;
          if (parsed?.days?.length) {
            plan = {
              id: 0,
              title: parsed.title || fallback.title,
              summary: parsed.summary || fallback.summary,
              days: parsed.days,
              createdAt: new Date().toISOString(),
            };
          }
        }
      } catch {
        plan = fallback;
      }
    }

    const inserted = await sql<{ id: number; created_at: string }>`
      insert into training_plans (user_id, title, summary, days)
      values (${context.userId}, ${plan.title}, ${plan.summary}, ${JSON.stringify(plan.days)})
      returning id, created_at
    `;
    return {
      ok: true as const,
      plan: { ...plan, id: inserted[0]?.id ?? 0, createdAt: inserted[0]?.created_at ?? plan.createdAt },
    };
  });
