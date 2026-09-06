import { LM, type Landmark } from "./types";

export function vis(lm: Landmark | undefined, min = 0.35): boolean {
  return Boolean(lm && (lm.visibility === undefined || lm.visibility >= min));
}

export function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (mag < 1e-6) return 180;
  const cos = Math.min(1, Math.max(-1, (abx * cbx + aby * cby) / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function mid(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility, b.visibility),
  };
}

export function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function torsoTiltDeg(landmarks: Landmark[]): number {
  const ls = landmarks[LM.leftShoulder];
  const rs = landmarks[LM.rightShoulder];
  const lh = landmarks[LM.leftHip];
  const rh = landmarks[LM.rightHip];
  if (!ls || !rs || !lh || !rh) return 0;
  const s = mid(ls, rs);
  const h = mid(lh, rh);
  const dx = s.x - h.x;
  const dy = h.y - s.y;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

export function bodyLineDeg(landmarks: Landmark[]): number {
  const ls = landmarks[LM.leftShoulder];
  const rs = landmarks[LM.rightShoulder];
  const la = landmarks[LM.leftAnkle];
  const ra = landmarks[LM.rightAnkle];
  if (!ls || !rs || !la || !ra) return 0;
  const s = mid(ls, rs);
  const a = mid(la, ra);
  const dx = s.x - a.x;
  const dy = a.y - s.y;
  return Math.abs((Math.atan2(dx, dy) * 180) / Math.PI);
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function requiredVisible(landmarks: Landmark[], idxs: number[], min = 0.35): boolean {
  return idxs.every((i) => vis(landmarks[i], min));
}

export const FULL_BODY = [
  LM.leftShoulder,
  LM.rightShoulder,
  LM.leftHip,
  LM.rightHip,
  LM.leftKnee,
  LM.rightKnee,
  LM.leftAnkle,
  LM.rightAnkle,
];
