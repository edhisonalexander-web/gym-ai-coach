import type { DetectorKind } from "@/lib/exercises/types";
import type { Landmark } from "./types";

function pt(x: number, y: number, z = 0): Landmark {
  return { x, y, z, visibility: 0.99 };
}

function blank(): Landmark[] {
  return Array.from({ length: 33 }, () => pt(0.5, 0.5));
}

function apply(base: Landmark[], map: Record<number, [number, number]>): Landmark[] {
  const out = base.map((p) => ({ ...p }));
  for (const [key, value] of Object.entries(map)) out[Number(key)] = pt(value[0], value[1]);
  return out;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function wave(t: number, speed = 1, min = 0, max = 1) {
  return lerp(min, max, (Math.sin(t * speed) + 1) / 2);
}

/** A readable front-facing standing pose shared by all demonstrations. */
function rest(): Landmark[] {
  return apply(blank(), {
    0: [0.5, 0.13], 1: [0.48, 0.12], 2: [0.47, 0.12], 3: [0.45, 0.12],
    4: [0.52, 0.12], 5: [0.53, 0.12], 6: [0.55, 0.12], 7: [0.43, 0.13], 8: [0.57, 0.13],
    9: [0.47, 0.16], 10: [0.53, 0.16], 11: [0.38, 0.24], 12: [0.62, 0.24],
    13: [0.34, 0.38], 14: [0.66, 0.38], 15: [0.32, 0.5], 16: [0.68, 0.5],
    17: [0.3, 0.53], 18: [0.7, 0.53], 19: [0.3, 0.51], 20: [0.7, 0.51],
    21: [0.33, 0.49], 22: [0.67, 0.49], 23: [0.43, 0.5], 24: [0.57, 0.5],
    25: [0.42, 0.7], 26: [0.58, 0.7], 27: [0.41, 0.9], 28: [0.59, 0.9],
    29: [0.4, 0.93], 30: [0.6, 0.93], 31: [0.42, 0.95], 32: [0.58, 0.95],
  });
}

function squatPose(t: number, wide = false, staggered = false): Landmark[] {
  const r = rest();
  const d = wave(t, 2.2);
  const drop = d * 0.16;
  const hipDrop = d * 0.18;
  const kneeOut = d * 0.055;
  const torsoLean = d * 0.018;
  const spread = wide ? 0.1 : 0;
  const pose = apply(r, {
    0: [0.5 + torsoLean, 0.13 + drop], 11: [0.38 + torsoLean, 0.24 + drop], 12: [0.62 + torsoLean, 0.24 + drop],
    13: [0.34 + torsoLean, 0.38 + drop * 0.92], 14: [0.66 + torsoLean, 0.38 + drop * 0.92],
    23: [0.43 + torsoLean, 0.5 + hipDrop], 24: [0.57 + torsoLean, 0.5 + hipDrop],
    25: [0.42 - spread - kneeOut, 0.7 + drop * 0.12], 26: [0.58 + spread + kneeOut, 0.7 + drop * 0.12],
    27: [0.41 - spread, 0.9], 28: [0.59 + spread, 0.9], 29: [0.4 - spread, 0.93], 30: [0.6 + spread, 0.93],
    31: [0.42 - spread, 0.95], 32: [0.58 + spread, 0.95],
  });
  if (staggered) {
    return apply(pose, { 23: [0.4, 0.5 + hipDrop], 24: [0.58, 0.5 + hipDrop], 25: [0.33, 0.7 + drop * 0.12], 26: [0.68, 0.67], 27: [0.26, 0.9], 28: [0.73, 0.84], 31: [0.22, 0.95], 32: [0.78, 0.89] });
  }
  return pose;
}

function pushupPose(t: number, narrow = false, pike = false): Landmark[] {
  const r = rest();
  const d = wave(t, 2.1);
  const drop = d * 0.1;
  const shoulderY = pike ? 0.38 : 0.48 + drop;
  const hipY = pike ? 0.56 : 0.5 + drop;
  return apply(r, {
    0: [pike ? 0.43 : 0.5, pike ? 0.29 + drop * 0.5 : 0.42 + drop],
    11: [0.3, shoulderY], 12: [0.7, shoulderY],
    13: [narrow ? 0.43 : 0.28, pike ? 0.5 : 0.62], 14: [narrow ? 0.57 : 0.72, pike ? 0.5 : 0.62],
    15: [narrow ? 0.42 : 0.26, 0.78], 16: [narrow ? 0.58 : 0.74, 0.78],
    23: [0.38, hipY], 24: [0.62, hipY], 25: [0.4, pike ? 0.72 : 0.68], 26: [0.6, pike ? 0.72 : 0.68],
    27: [0.4, 0.88], 28: [0.6, 0.88], 31: [0.4, 0.91], 32: [0.6, 0.91],
  });
}

function lungePose(t: number, bulgarian = false): Landmark[] {
  const r = rest();
  const d = wave(t, 2.0);
  return apply(r, {
    0: [0.5, 0.14 + d * 0.1], 11: [0.38, 0.25 + d * 0.1], 12: [0.62, 0.25 + d * 0.1],
    23: [0.43, 0.5 + d * 0.1], 24: [0.56, 0.5 + d * 0.1],
    25: [0.36, 0.68 + d * 0.05], 26: [bulgarian ? 0.62 : 0.62, 0.72],
    27: [0.34, 0.9], 28: [bulgarian ? 0.78 : 0.66, bulgarian ? 0.84 : 0.78],
    31: [0.33, 0.94], 32: [bulgarian ? 0.87 : 0.68, 0.82],
  });
}

function plankPose(t: number, side = false): Landmark[] {
  const r = rest();
  const shift = side ? Math.sin(t * 2) * 0.025 : 0;
  return apply(r, {
    0: [0.32 + shift, 0.42], 11: [0.28 + shift, 0.48], 12: [0.4 + shift, 0.46],
    13: [0.24 + shift, 0.6], 14: [0.38 + shift, 0.58], 15: [0.2 + shift, 0.74], 16: [0.36 + shift, 0.72],
    23: [0.55 + shift, 0.5], 24: [0.66 + shift, 0.5], 25: [0.62 + shift, 0.7], 26: [0.74 + shift, 0.7],
    27: [0.78 + shift, 0.78], 28: [0.86 + shift, 0.78], 31: [0.79 + shift, 0.8], 32: [0.87 + shift, 0.8],
  });
}

function hingePose(t: number, swing = false): Landmark[] {
  const r = rest();
  const d = wave(t, swing ? 3.2 : 2.0);
  const h = d * 0.16;
  return apply(r, {
    0: [0.5 + h * 0.3, 0.16 + h], 11: [0.38 + h * 0.5, 0.26 + h], 12: [0.62 + h * 0.5, 0.26 + h],
    13: [0.3 + h, swing ? 0.46 : 0.4], 14: [0.7 + h, swing ? 0.46 : 0.4],
    15: [0.28 + h, swing ? 0.65 : 0.52], 16: [0.72 + h, swing ? 0.65 : 0.52],
    23: [0.44, 0.5 + h * 0.3], 24: [0.56, 0.5 + h * 0.3], 25: [0.4, 0.7], 26: [0.6, 0.7],
    27: [0.4, 0.9], 28: [0.6, 0.9],
  });
}

function floorPose(variant: string, t: number): Landmark[] {
  const r = rest();
  const d = wave(t, 2.0);
  if (variant === "dead-bug") {
    return apply(r, { 0: [0.5, 0.58], 11: [0.4, 0.62], 12: [0.6, 0.62], 23: [0.43, 0.68], 24: [0.57, 0.68], 13: [0.3, 0.48], 14: [0.7, 0.48], 15: [0.22, 0.35], 16: [0.78, 0.35], 25: [0.35, 0.55], 26: [0.65, 0.55], 27: [0.26, 0.42 + d * 0.08], 28: [0.74, 0.42 - d * 0.08] });
  }
  if (variant === "isometrico-core-hollow") {
    return apply(r, { 0: [0.42, 0.62], 11: [0.48, 0.66], 12: [0.56, 0.66], 23: [0.62, 0.7], 24: [0.68, 0.7], 15: [0.28, 0.5], 16: [0.78, 0.5], 27: [0.25, 0.8], 28: [0.8, 0.8] });
  }
  return apply(r, { 0: [0.5, 0.42 - d * 0.08], 11: [0.4, 0.5 - d * 0.08], 12: [0.6, 0.5 - d * 0.08], 23: [0.42, 0.62], 24: [0.58, 0.62], 25: [0.4, 0.55], 26: [0.6, 0.55], 27: [0.38, 0.72], 28: [0.62, 0.72] });
}

function genericPose(variant: string, t: number): Landmark[] {
  const r = rest();
  const d = wave(t, 2.2);
  switch (variant) {
    case "fondos":
      return apply(r, { 0: [0.5, 0.34 + d * 0.08], 11: [0.38, 0.43 + d * 0.08], 12: [0.62, 0.43 + d * 0.08], 13: [0.34, 0.56 + d * 0.12], 14: [0.66, 0.56 + d * 0.12], 15: [0.31, 0.65 + d * 0.1], 16: [0.69, 0.65 + d * 0.1], 23: [0.43, 0.57 + d * 0.08], 24: [0.57, 0.57 + d * 0.08], 25: [0.39, 0.72], 26: [0.61, 0.72], 27: [0.35, 0.9], 28: [0.65, 0.9] });
    case "dominadas":
      return apply(r, { 0: [0.5, 0.3], 11: [0.4, 0.39], 12: [0.6, 0.39], 13: [0.32, 0.25 - d * 0.06], 14: [0.68, 0.25 - d * 0.06], 15: [0.28, 0.14 - d * 0.03], 16: [0.72, 0.14 - d * 0.03], 23: [0.43, 0.55], 24: [0.57, 0.55], 25: [0.4, 0.72], 26: [0.6, 0.72], 27: [0.4, 0.9], 28: [0.6, 0.9] });
    case "remo-invertido":
      return apply(r, { 0: [0.32, 0.48], 11: [0.38, 0.54], 12: [0.5, 0.55], 13: [0.46, 0.62 - d * 0.08], 14: [0.58, 0.62 - d * 0.08], 15: [0.55, 0.72 - d * 0.12], 16: [0.67, 0.72 - d * 0.12], 23: [0.64, 0.62], 24: [0.75, 0.62], 25: [0.78, 0.74], 26: [0.86, 0.74], 27: [0.9, 0.88], 28: [0.94, 0.88] });
    case "bird-dog":
      return apply(r, { 0: [0.34, 0.44], 11: [0.38, 0.5], 12: [0.48, 0.5], 15: [0.28, 0.7], 16: [0.58 + d * 0.16, 0.7 - d * 0.16], 23: [0.58, 0.55], 24: [0.68, 0.55], 25: [0.72, 0.7], 26: [0.78 - d * 0.16, 0.7 + d * 0.05], 27: [0.86, 0.78], 28: [0.94, 0.78] });
    case "face-pull":
      return apply(r, { 13: [0.38, 0.28 + d * 0.1], 14: [0.62, 0.28 + d * 0.1], 15: [0.43, 0.24 - d * 0.08], 16: [0.57, 0.24 - d * 0.08] });
    case "remo-mancuerna":
      return apply(r, { 0: [0.5, 0.25], 11: [0.38, 0.36], 12: [0.62, 0.36], 13: [0.3, 0.48], 14: [0.7, 0.48], 15: [0.4, 0.38 - d * 0.12], 16: [0.6, 0.38 - d * 0.12], 23: [0.43, 0.54], 24: [0.57, 0.54] });
    case "press-banca":
      return apply(r, { 0: [0.5, 0.55], 11: [0.4, 0.6], 12: [0.6, 0.6], 13: [0.3, 0.52 - d * 0.08], 14: [0.7, 0.52 - d * 0.08], 15: [0.22, 0.42 - d * 0.08], 16: [0.78, 0.42 - d * 0.08], 23: [0.43, 0.7], 24: [0.57, 0.7], 25: [0.4, 0.8], 26: [0.6, 0.8], 27: [0.36, 0.92], 28: [0.64, 0.92] });
    case "step-up":
      return apply(r, { 0: [0.5, 0.16 - d * 0.03], 23: [0.44, 0.5], 24: [0.56, 0.5], 25: [0.38, 0.67], 26: [0.6, 0.6 - d * 0.08], 27: [0.37, 0.9], 28: [0.68, 0.72 - d * 0.08] });
    case "extension-triceps":
      return apply(r, { 13: [0.42, 0.34], 14: [0.58, 0.34], 15: [0.48, 0.2 + d * 0.08], 16: [0.52, 0.2 + d * 0.08] });
    case "elevaciones-laterales":
      return apply(r, { 13: [0.25, 0.3 - d * 0.2], 14: [0.75, 0.3 - d * 0.2], 15: [0.18, 0.32 - d * 0.2], 16: [0.82, 0.32 - d * 0.2] });
    default:
      return rest();
  }
}

/** Generate a complete, human-readable instructor pose for every catalog exercise. */
export function demoPose(kind: DetectorKind, tSec: number, variant = ""): Landmark[] {
  const t = tSec;
  switch (variant) {
    case "sentadilla-sumo": return squatPose(t, true);
    case "sentadilla-bulgara": return lungePose(t, true);
    case "flexiones-diamante": return pushupPose(t, true);
    case "pike-push-up": return pushupPose(t, false, true);
    case "plancha-lateral": return plankPose(t, true);
    case "swing-mancuerna": return hingePose(t, true);
    case "crunch": case "dead-bug": case "isometrico-core-hollow": return floorPose(variant, t);
    case "fondos": case "dominadas": case "remo-invertido": case "bird-dog": case "face-pull":
    case "remo-mancuerna": case "press-banca": case "step-up": case "extension-triceps": case "elevaciones-laterales":
      return genericPose(variant, t);
    case "sentadilla": return squatPose(t);
    case "flexiones": return pushupPose(t);
    case "zancadas": return lungePose(t);
    case "plancha": return plankPose(t);
    case "peso-muerto": return hingePose(t);
    case "curl-biceps": {
      const r = rest(); const up = wave(t, 2.4); const y = lerp(0.5, 0.28, up);
      return apply(r, { 13: [0.34, 0.38], 14: [0.66, 0.38], 15: [0.36, y], 16: [0.64, y] });
    }
    case "press-militar": {
      const r = rest(); const up = wave(t, 2.1); const y = lerp(0.32, 0.08, up);
      return apply(r, { 13: [0.36, lerp(0.32, 0.18, up)], 14: [0.64, lerp(0.32, 0.18, up)], 15: [0.38, y], 16: [0.62, y] });
    }
    case "jumping-jacks": {
      const r = rest(); const open = wave(t, 2.4); const ax = lerp(0.12, 0.22, open);
      return apply(r, { 15: [0.5 - ax - 0.08, lerp(0.5, 0.16, open)], 16: [0.5 + ax + 0.08, lerp(0.5, 0.16, open)], 13: [0.38 - ax * 0.4, lerp(0.38, 0.26, open)], 14: [0.62 + ax * 0.4, lerp(0.38, 0.26, open)], 25: [0.5 - lerp(0.08, 0.16, open), 0.7], 26: [0.5 + lerp(0.08, 0.16, open), 0.7], 27: [0.5 - lerp(0.08, 0.2, open), 0.9], 28: [0.5 + lerp(0.08, 0.2, open), 0.9] });
    }
    case "mountain-climbers": {
      const p = plankPose(t); const step = Math.sin(t * 6);
      return apply(p, { 25: [0.62 + step * 0.12, 0.58], 26: [0.74 - step * 0.12, 0.72] });
    }
    case "elevacion-gemelos": {
      const r = rest(); const up = wave(t, 2.4) * 0.05;
      return apply(r, { 0: [0.5, 0.13 - up], 11: [0.38, 0.24 - up], 12: [0.62, 0.24 - up], 23: [0.43, 0.5 - up], 24: [0.57, 0.5 - up], 25: [0.42, 0.7 - up], 26: [0.58, 0.7 - up], 27: [0.41, 0.9 - up], 28: [0.59, 0.9 - up] });
    }
    case "burpees": {
      const cycle = (t * 0.35) % 1;
      if (cycle < 0.25) return squatPose(t * 4);
      if (cycle < 0.5) return pushupPose(t * 4);
      if (cycle < 0.75) return squatPose(t * 4);
      return apply(rest(), { 15: [0.32, 0.18], 16: [0.68, 0.18] });
    }
    case "wall-sit": return apply(rest(), { 0: [0.5, 0.28], 11: [0.38, 0.38], 12: [0.62, 0.38], 23: [0.43, 0.58], 24: [0.57, 0.58], 25: [0.42, 0.72], 26: [0.58, 0.72] });
    case "hip-thrust": case "puente-gluteo": return apply(rest(), { 0: [0.5, 0.55 - wave(t, 2.2) * 0.12], 11: [0.4, 0.6], 12: [0.6, 0.6], 23: [0.43, 0.62], 24: [0.57, 0.62], 25: [0.42, 0.7], 26: [0.58, 0.7], 27: [0.4, 0.88], 28: [0.6, 0.88] });
    default:
      if (kind === "squat") return squatPose(t);
      if (kind === "pushup") return pushupPose(t);
      if (kind === "lunge") return lungePose(t);
      if (kind === "plank" || kind === "climber") return plankPose(t);
      if (kind === "hinge") return hingePose(t);
      if (kind === "crunch") return floorPose("crunch", t);
      return genericPose(variant, t);
  }
}
