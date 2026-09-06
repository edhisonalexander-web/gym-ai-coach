import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FREE_SESSIONS_PER_DAY, type WorkoutRow } from "./types";

type WorkoutDb = {
  id: number;
  user_id: string;
  exercise_slug: string;
  exercise_name: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  reps: number;
  form_score: number;
  calories: number;
  issues: string;
  muscles: string;
  source: string;
};

function parseList(raw: string | string[] | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function mapWorkout(row: WorkoutDb): WorkoutRow {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseSlug: row.exercise_slug,
    exerciseName: row.exercise_name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSec: row.duration_sec,
    reps: row.reps,
    formScore: row.form_score,
    calories: row.calories,
    issues: parseList(row.issues),
    muscles: parseList(row.muscles),
    source: row.source,
  };
}

export type SaveWorkoutInput = {
  exerciseSlug: string;
  exerciseName: string;
  durationSec: number;
  reps: number;
  formScore: number;
  calories: number;
  issues: string[];
  muscles: string[];
  source: "camera" | "demo";
};

export const getTodaySessionCount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ n: number; is_premium: boolean | null }>`
      select
        (select count(*)::int from workouts
          where user_id = ${context.userId}
            and started_at >= date_trunc('day', now())) as n,
        (select is_premium from profiles where user_id = ${context.userId}) as is_premium
    `;
    const n = rows[0]?.n ?? 0;
    const premium = Boolean(rows[0]?.is_premium);
    return {
      count: n,
      limit: FREE_SESSIONS_PER_DAY,
      remaining: premium ? 999 : Math.max(0, FREE_SESSIONS_PER_DAY - n),
      isPremium: premium,
    };
  });

export const listWorkouts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<WorkoutDb>`
      select id, user_id, exercise_slug, exercise_name, started_at, ended_at,
             duration_sec, reps, form_score, calories, issues, muscles, source
      from workouts
      where user_id = ${context.userId}
      order by started_at desc
      limit 80
    `;
    return rows.map(mapWorkout);
  });

export const saveWorkout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: SaveWorkoutInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const quota = await sql<{ n: number; is_premium: boolean | null }>`
      select
        (select count(*)::int from workouts
          where user_id = ${context.userId}
            and started_at >= date_trunc('day', now())) as n,
        (select is_premium from profiles where user_id = ${context.userId}) as is_premium
    `;
    const premium = Boolean(quota[0]?.is_premium);
    if (!premium && (quota[0]?.n ?? 0) >= FREE_SESSIONS_PER_DAY) {
      return { ok: false as const, error: "limit" };
    }
    const rows = await sql<{ id: number }>`
      insert into workouts (
        user_id, exercise_slug, exercise_name, ended_at, duration_sec, reps,
        form_score, calories, issues, muscles, source
      ) values (
        ${context.userId}, ${data.exerciseSlug}, ${data.exerciseName}, now(),
        ${Math.round(data.durationSec)}, ${Math.round(data.reps)},
        ${Math.round(data.formScore)}, ${Math.round(data.calories)},
        ${JSON.stringify(data.issues)}, ${JSON.stringify(data.muscles)}, ${data.source}
      )
      returning id
    `;
    return { ok: true as const, id: rows[0]?.id ?? 0 };
  });

export const getStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const totals = await sql<{
      sessions: number;
      reps: number;
      seconds: number;
      calories: number;
      avg_score: number | null;
    }>`
      select
        count(*)::int as sessions,
        coalesce(sum(reps), 0)::int as reps,
        coalesce(sum(duration_sec), 0)::int as seconds,
        coalesce(sum(calories), 0)::int as calories,
        avg(form_score) as avg_score
      from workouts where user_id = ${context.userId}
    `;
    const weekly = await sql<{ day: string; reps: number; sessions: number; score: number }>`
      select to_char(started_at, 'YYYY-MM-DD') as day,
             coalesce(sum(reps), 0)::int as reps,
             count(*)::int as sessions,
             coalesce(avg(form_score), 0) as score
      from workouts
      where user_id = ${context.userId}
        and started_at >= now() - interval '14 days'
      group by 1
      order by 1
    `;
    const muscles = await sql<{ exercise_name: string; muscles: string; reps: number }>`
      select exercise_name, muscles, reps from workouts
      where user_id = ${context.userId}
      order by started_at desc
      limit 40
    `;
    const t = totals[0];
    const muscleCount: Record<string, number> = {};
    for (const row of muscles) {
      for (const m of parseList(row.muscles)) {
        muscleCount[m] = (muscleCount[m] ?? 0) + row.reps;
      }
    }
    return {
      sessions: t?.sessions ?? 0,
      reps: t?.reps ?? 0,
      seconds: t?.seconds ?? 0,
      calories: t?.calories ?? 0,
      avgScore: t?.avg_score == null ? 0 : Math.round(Number(t.avg_score)),
      weekly: weekly.map((w) => ({
        day: w.day,
        reps: w.reps,
        sessions: w.sessions,
        score: Math.round(Number(w.score)),
      })),
      muscles: Object.entries(muscleCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    };
  });
