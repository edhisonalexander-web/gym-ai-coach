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
  for (const [k, v] of Object.entries(map)) {
    const i = Number(k);
    out[i] = pt(v[0], v[1]);
  }
  return out;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function wave(t: number, speed = 1, min = 0, max = 1) {
  const s = (Math.sin(t * speed) + 1) / 2;
  return lerp(min, max, s);
}

/** Front-facing rest pose, normalized 0–1. */
function rest(): Landmark[] {
  return apply(blank(), {
    0: [0.5, 0.13],
    1: [0.48, 0.12],
    2: [0.47, 0.12],
    3: [0.45, 0.12],
    4: [0.52, 0.12],
    5: [0.53, 0.12],
    6: [0.55, 0.12],
    7: [0.43, 0.13],
    8: [0.57, 0.13],
    9: [0.47, 0.16],
    10: [0.53, 0.16],
    11: [0.38, 0.24],
    12: [0.62, 0.24],
    13: [0.34, 0.38],
    14: [0.66, 0.38],
    15: [0.32, 0.5],
    16: [0.68, 0.5],
    17: [0.3, 0.53],
    18: [0.7, 0.53],
    19: [0.3, 0.51],
    20: [0.7, 0.51],
    21: [0.33, 0.49],
    22: [0.67, 0.49],
    23: [0.43, 0.5],
    24: [0.57, 0.5],
    25: [0.42, 0.7],
    26: [0.58, 0.7],
    27: [0.41, 0.9],
    28: [0.59, 0.9],
    29: [0.4, 0.93],
    30: [0.6, 0.93],
    31: [0.42, 0.95],
    32: [0.58, 0.95],
  });
}

export function demoPose(kind: DetectorKind, tSec: number): Landmark[] {
  const t = tSec;
  const r = rest();
  const d = wave(t, 2.2, 0, 1);
  const d2 = wave(t, 2.2, 0, 1);

  switch (kind) {
    case "squat": {
      const drop = d * 0.16;
      const kneeFwd = d * 0.03;
      return apply(r, {
        0: [0.5, 0.13 + drop],
        11: [0.38, 0.24 + drop],
        12: [0.62, 0.24 + drop],
        13: [0.33, 0.38 + drop],
        14: [0.67, 0.38 + drop],
        15: [0.32, 0.5 + drop * 0.6],
        16: [0.68, 0.5 + drop * 0.6],
        23: [0.43, 0.5 + drop],
        24: [0.57, 0.5 + drop],
        25: [0.42 + kneeFwd, 0.7 + drop * 0.35],
        26: [0.58 - kneeFwd, 0.7 + drop * 0.35],
      });
    }
    case "pushup": {
      const drop = d * 0.12;
      return apply(r, {
        0: [0.5, 0.42 + drop],
        11: [0.3, 0.48 + drop],
        12: [0.7, 0.48 + drop],
        13: [0.28, 0.62],
        14: [0.72, 0.62],
        15: [0.26, 0.78],
        16: [0.74, 0.78],
        23: [0.38, 0.5 + drop],
        24: [0.62, 0.5 + drop],
        25: [0.4, 0.68 + drop * 0.2],
        26: [0.6, 0.68 + drop * 0.2],
        27: [0.4, 0.88],
        28: [0.6, 0.88],
      });
    }
    case "lunge": {
      const drop = d * 0.1;
      return apply(r, {
        0: [0.5, 0.14 + drop],
        11: [0.38, 0.25 + drop],
        12: [0.62, 0.25 + drop],
        23: [0.44, 0.5 + drop],
        24: [0.56, 0.5 + drop],
        25: [0.36, 0.68 + drop * 0.2],
        26: [0.62, 0.72],
        27: [0.34, 0.9],
        28: [0.66, 0.78 + drop * 0.15],
        31: [0.33, 0.94],
        32: [0.68, 0.82],
      });
    }
    case "plank":
    case "climber": {
      const step = Math.sin(t * 6);
      const lKnee = kind === "climber" ? 0.58 + step * 0.12 : 0.7;
      const rKnee = kind === "climber" ? 0.58 - step * 0.12 : 0.7;
      return apply(r, {
        0: [0.32, 0.42],
        11: [0.28, 0.48],
        12: [0.4, 0.46],
        13: [0.24, 0.6],
        14: [0.38, 0.58],
        15: [0.2, 0.74],
        16: [0.36, 0.72],
        23: [0.55, 0.5],
        24: [0.66, 0.5],
        25: [0.62, lKnee],
        26: [0.74, rKnee],
        27: [0.78, 0.78],
        28: [0.86, 0.78],
      });
    }
    case "curl": {
      const up = d;
      const wy = lerp(0.52, 0.28, up);
      return apply(r, {
        13: [0.34, 0.38],
        14: [0.66, 0.38],
        15: [0.36, wy],
        16: [0.64, wy],
      });
    }
    case "press": {
      const up = d;
      const wy = lerp(0.32, 0.08, up);
      return apply(r, {
        13: [0.36, lerp(0.32, 0.18, up)],
        14: [0.64, lerp(0.32, 0.18, up)],
        15: [0.38, wy],
        16: [0.62, wy],
      });
    }
    case "hinge": {
      const h = d * 0.12;
      return apply(r, {
        0: [0.5 + h * 0.4, 0.16 + h],
        11: [0.38 + h * 0.5, 0.26 + h],
        12: [0.62 + h * 0.5, 0.26 + h],
        15: [0.4, 0.55 + h * 0.4],
        16: [0.6, 0.55 + h * 0.4],
        23: [0.44, 0.5 + h * 0.3],
        24: [0.56, 0.5 + h * 0.3],
      });
    }
    case "crunch": {
      const up = d * 0.1;
      return apply(r, {
        0: [0.5, 0.42 - up],
        11: [0.4, 0.5 - up],
        12: [0.6, 0.5 - up],
        23: [0.42, 0.62],
        24: [0.58, 0.62],
        25: [0.4, 0.55],
        26: [0.6, 0.55],
        27: [0.38, 0.72],
        28: [0.62, 0.72],
      });
    }
    case "jacks": {
      const open = d2;
      const ax = lerp(0.12, 0.22, open);
      const wy = lerp(0.5, 0.16, open);
      return apply(r, {
        15: [0.5 - ax - 0.08, wy],
        16: [0.5 + ax + 0.08, wy],
        13: [0.38 - ax * 0.4, lerp(0.38, 0.26, open)],
        14: [0.62 + ax * 0.4, lerp(0.38, 0.26, open)],
        27: [0.5 - lerp(0.08, 0.2, open), 0.9],
        28: [0.5 + lerp(0.08, 0.2, open), 0.9],
        25: [0.5 - lerp(0.08, 0.16, open), 0.7],
        26: [0.5 + lerp(0.08, 0.16, open), 0.7],
      });
    }
    case "calfraise": {
      const up = d * 0.05;
      return apply(r, {
        0: [0.5, 0.13 - up],
        11: [0.38, 0.24 - up],
        12: [0.62, 0.24 - up],
        23: [0.43, 0.5 - up],
        24: [0.57, 0.5 - up],
        25: [0.42, 0.7 - up],
        26: [0.58, 0.7 - up],
        27: [0.41, 0.9 - up],
        28: [0.59, 0.9 - up],
        31: [0.42, 0.95],
        32: [0.58, 0.95],
      });
    }
    case "burpee": {
      const cycle = (t * 0.35) % 1;
      if (cycle < 0.25) return demoPose("squat", t * 4);
      if (cycle < 0.5) return demoPose("pushup", t * 4);
      if (cycle < 0.75) return demoPose("squat", t * 4);
      return apply(r, {
        15: [0.32, 0.18],
        16: [0.68, 0.18],
      });
    }
    case "wallsit":
      return apply(r, {
        0: [0.5, 0.28],
        11: [0.38, 0.38],
        12: [0.62, 0.38],
        23: [0.43, 0.58],
        24: [0.57, 0.58],
        25: [0.42, 0.72],
        26: [0.58, 0.72],
      });
    case "hipthrust": {
      const up = d * 0.12;
      return apply(r, {
        0: [0.5, 0.55 - up],
        11: [0.4, 0.6 - up * 0.4],
        12: [0.6, 0.6 - up * 0.4],
        23: [0.43, 0.62 - up],
        24: [0.57, 0.62 - up],
        25: [0.42, 0.7],
        26: [0.58, 0.7],
        27: [0.4, 0.88],
        28: [0.6, 0.88],
      });
    }
    default:
      return demoPose("squat", t);
  }
}
