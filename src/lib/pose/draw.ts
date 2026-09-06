import { POSE_CONNECTIONS, type Landmark } from "./types";

export function drawPose(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  opts: { mirror?: boolean; accent?: string; warn?: boolean; w: number; h: number },
) {
  const { w, h, mirror = true, accent = "#3ee0c5", warn = false } = opts;
  const xOf = (lm: Landmark) => (mirror ? 1 - lm.x : lm.x) * w;
  const yOf = (lm: Landmark) => lm.y * h;
  const bone = warn ? "rgba(240,113,103,0.85)" : "rgba(62,224,197,0.8)";
  const joint = warn ? "#f07167" : accent;

  ctx.lineWidth = Math.max(2.5, w * 0.006);
  ctx.lineCap = "round";
  ctx.strokeStyle = bone;
  ctx.shadowColor = bone;
  ctx.shadowBlur = 12;

  for (const [a, b] of POSE_CONNECTIONS) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb || pa.visibility < 0.3 || pb.visibility < 0.3) continue;
    ctx.beginPath();
    ctx.moveTo(xOf(pa), yOf(pa));
    ctx.lineTo(xOf(pb), yOf(pb));
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  for (const lm of landmarks) {
    if (lm.visibility < 0.3) continue;
    ctx.beginPath();
    ctx.fillStyle = joint;
    ctx.arc(xOf(lm), yOf(lm), Math.max(2.5, w * 0.008), 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawStudioBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0c1113");
  g.addColorStop(1, "#07090a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(238,243,241,0.04)";
  ctx.lineWidth = 1;
  const floorY = h * 0.88;
  for (let i = 0; i < 8; i++) {
    const y = floorY + i * 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(62,224,197,0.08)";
  ctx.beginPath();
  ctx.moveTo(w * 0.15, floorY);
  ctx.lineTo(w * 0.85, floorY);
  ctx.stroke();
}
