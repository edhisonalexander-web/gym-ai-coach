export type Profile = {
  userId: string;
  displayName: string | null;
  age: number | null;
  sex: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  experience: string | null;
  daysPerWeek: number;
  equipment: string;
  isPremium: boolean;
  onboardingComplete: boolean;
  voiceCues: boolean;
};

export type WorkoutRow = {
  id: number;
  userId: string;
  exerciseSlug: string;
  exerciseName: string;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  reps: number;
  formScore: number;
  calories: number;
  issues: string[];
  muscles: string[];
  source: string;
};

export type PlanDay = {
  day: string;
  title: string;
  focus: string;
  durationMin: number;
  exercises: Array<{
    slug: string;
    name: string;
    sets: string;
    reps: string;
    restSec: number;
    notes: string;
  }>;
};

export type TrainingPlan = {
  id: number;
  title: string;
  summary: string;
  days: PlanDay[];
  createdAt: string;
};

export type ProfileInput = {
  displayName?: string;
  age: number;
  sex: string;
  heightCm: number;
  weightKg: number;
  goal: string;
  experience: string;
  daysPerWeek: number;
  equipment: string;
  voiceCues?: boolean;
};

export const GOALS = [
  { id: "fuerza", label: "Ganar fuerza" },
  { id: "hipertrofia", label: "Ganar músculo" },
  { id: "grasa", label: "Perder grasa" },
  { id: "calistenia", label: "Calistenia / skills" },
  { id: "salud", label: "Salud y postura" },
] as const;

export const EXPERIENCE = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
] as const;

export const EQUIPMENT = [
  { id: "peso corporal", label: "Peso corporal" },
  { id: "mancuernas", label: "Mancuernas" },
  { id: "barra", label: "Barra / rack" },
  { id: "banda", label: "Bandas" },
  { id: "mixto", label: "Mixto" },
] as const;

export const FREE_SESSIONS_PER_DAY = 3;
