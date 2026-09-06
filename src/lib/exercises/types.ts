export type MuscleGroup =
  | "pecho"
  | "espalda"
  | "hombros"
  | "biceps"
  | "triceps"
  | "core"
  | "cuadriceps"
  | "isquios"
  | "gluteos"
  | "gemelos"
  | "cuerpo"
  | "cardio";

export type Experience = "principiante" | "intermedio" | "avanzado";
export type Equipment = "peso corporal" | "mancuernas" | "barra" | "banco" | "banda";

export type DetectorKind =
  | "squat"
  | "pushup"
  | "lunge"
  | "plank"
  | "curl"
  | "press"
  | "hinge"
  | "crunch"
  | "jacks"
  | "climber"
  | "calfraise"
  | "burpee"
  | "wallsit"
  | "hipthrust"
  | "generic";

export type FormError = {
  error: string;
  fix: string;
  risk: string;
};

export type Exercise = {
  slug: string;
  name: string;
  aka?: string;
  group: MuscleGroup;
  secondary: MuscleGroup[];
  level: Experience;
  equipment: Equipment;
  live: boolean;
  detector: DetectorKind;
  musclesWorking: string[];
  setup: string[];
  cues: string[];
  commonErrors: FormError[];
  injuryRisks: string[];
  met: number;
  summary: string;
};

export const GROUP_LABEL: Record<MuscleGroup, string> = {
  pecho: "Pecho",
  espalda: "Espalda",
  hombros: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  core: "Core",
  cuadriceps: "Cuádriceps",
  isquios: "Isquiotibiales",
  gluteos: "Glúteos",
  gemelos: "Gemelos",
  cuerpo: "Cuerpo completo",
  cardio: "Cardio",
};

export const GROUP_ORDER: MuscleGroup[] = [
  "pecho",
  "espalda",
  "hombros",
  "biceps",
  "triceps",
  "core",
  "cuadriceps",
  "isquios",
  "gluteos",
  "gemelos",
  "cuerpo",
  "cardio",
];
