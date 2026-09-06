import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Profile, ProfileInput } from "./types";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  age: number | null;
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  experience: string | null;
  days_per_week: number;
  equipment: string;
  is_premium: boolean;
  onboarding_complete: boolean;
  voice_cues: boolean;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    age: row.age,
    sex: row.sex,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    goal: row.goal,
    experience: row.experience,
    daysPerWeek: row.days_per_week,
    equipment: row.equipment,
    isPremium: Boolean(row.is_premium),
    onboardingComplete: Boolean(row.onboarding_complete),
    voiceCues: Boolean(row.voice_cues),
  };
}

export const getProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ProfileRow>`
      select user_id, display_name, age, sex, height_cm, weight_kg, goal, experience,
             days_per_week, equipment, is_premium, onboarding_complete, voice_cues
      from profiles where user_id = ${context.userId}
    `;
    return rows[0] ? mapProfile(rows[0]) : null;
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProfileInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const age = Math.min(90, Math.max(13, Math.round(data.age)));
    const height = Math.min(230, Math.max(120, data.heightCm));
    const weight = Math.min(250, Math.max(35, data.weightKg));
    const days = Math.min(7, Math.max(2, Math.round(data.daysPerWeek)));
    await sql`
      insert into profiles (
        user_id, display_name, age, sex, height_cm, weight_kg, goal, experience,
        days_per_week, equipment, onboarding_complete, voice_cues, updated_at
      ) values (
        ${context.userId}, ${data.displayName ?? null}, ${age}, ${data.sex},
        ${height}, ${weight}, ${data.goal}, ${data.experience}, ${days},
        ${data.equipment}, true, ${data.voiceCues ?? true}, now()
      )
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        age = excluded.age,
        sex = excluded.sex,
        height_cm = excluded.height_cm,
        weight_kg = excluded.weight_kg,
        goal = excluded.goal,
        experience = excluded.experience,
        days_per_week = excluded.days_per_week,
        equipment = excluded.equipment,
        onboarding_complete = true,
        voice_cues = excluded.voice_cues,
        updated_at = now()
    `;
    const rows = await sql<ProfileRow>`
      select user_id, display_name, age, sex, height_cm, weight_kg, goal, experience,
             days_per_week, equipment, is_premium, onboarding_complete, voice_cues
      from profiles where user_id = ${context.userId}
    `;
    return mapProfile(rows[0]!);
  });

export const setPremium = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((on: boolean) => on)
  .handler(async ({ context, data: on }) => {
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, is_premium, updated_at)
      values (${context.userId}, ${on}, now())
      on conflict (user_id) do update set is_premium = ${on}, updated_at = now()
    `;
    return { isPremium: on };
  });

export const setVoiceCues = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((on: boolean) => on)
  .handler(async ({ context, data: on }) => {
    const sql = await getSql();
    await sql`
      update profiles set voice_cues = ${on}, updated_at = now()
      where user_id = ${context.userId}
    `;
    return { voiceCues: on };
  });
