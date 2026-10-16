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
  for (const [index, lm] of landmarks.entries()) {
    if (lm.visibility < 0.3) continue;
    ctx.beginPath();
    ctx.fillStyle = joint;
    const radius = index === 0 ? Math.max(13, w * 0.032) : Math.max(3.5, w * 0.009);
    ctx.arc(xOf(lm), yOf(lm), radius, 0, Math.PI * 2);
    ctx.fill();
    if (index === 0) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(7,9,10,0.42)";
      ctx.arc(xOf(lm) - radius * 0.22, yOf(lm) - radius * 0.12, radius * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1.5, w * 0.003);
      ctx.arc(xOf(lm), yOf(lm), radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
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

export function drawInstructorOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { phase: string; score: number; ready: boolean; cue: string; demo: boolean },
) {
  const { phase, score, ready, cue, demo } = opts;
  const good = score >= 85;
  const caution = score >= 65;
  const status = good ? "#5ee9a0" : caution ? "#e8b86d" : "#f07167";
  const statusText = !ready ? "Entra en el encuadre" : good ? "Postura correcta" : caution ? "Ajusta la postura" : "Corrige el movimiento";
  const phaseText = phase === "down" ? "BAJA CON TODO EL CUERPO" : phase === "up" ? "SUBE EMPUJANDO EL SUELO" : "MANTÉN LA POSICIÓN";
  const inset = Math.max(22, w * 0.08);
  const top = Math.max(78, h * 0.12);
  const bottom = h * 0.88;

  // Full-body framing guide: subtle in the camera, clearer in the demo.
  ctx.save();
  ctx.setLineDash([8, 10]);
  ctx.strokeStyle = demo ? "rgba(62,224,197,0.34)" : "rgba(238,243,241,0.36)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset, top, w - inset * 2, bottom - top);
  ctx.setLineDash([]);

  // Feet line makes it obvious that the feet stay planted during a squat.
  ctx.strokeStyle = `${status}99`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.29, bottom);
  ctx.lineTo(w * 0.71, bottom);
  ctx.stroke();

  // A plain phase label is easier to understand than abstract arrows.
  ctx.font = `600 ${Math.max(11, Math.min(14, w * 0.032))}px Manrope, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = demo && cue ? cue.toUpperCase() : phaseText;
  const labelWidth = ctx.measureText(label).width + 22;
  const labelY = h * 0.11;
  ctx.fillStyle = "rgba(7,9,10,0.78)";
  ctx.beginPath();
  ctx.roundRect(w / 2 - labelWidth / 2, labelY - 13, labelWidth, 26, 13);
  ctx.fill();
  ctx.fillStyle = status;
  ctx.fillText(label, w / 2, labelY);

  // Status chip doubles as an instructor cue for users who cannot rely on audio.
  const chip = `${statusText} · ${Math.round(score)}`;
  const chipWidth = ctx.measureText(chip).width + 26;
  ctx.fillStyle = "rgba(7,9,10,0.82)";
  ctx.beginPath();
  ctx.roundRect(w / 2 - chipWidth / 2, Math.max(18, h * 0.06), chipWidth, 30, 15);
  ctx.fill();
  ctx.fillStyle = status;
  ctx.fillText(chip, w / 2, Math.max(33, h * 0.06 + 15));

  // Short visual version of the spoken cue.
  if (cue && (!good || demo)) {
    ctx.font = `500 ${Math.max(11, Math.min(13, w * 0.03))}px Manrope, sans-serif`;
    const cueWidth = Math.min(w - 36, Math.max(180, ctx.measureText(cue).width + 28));
    ctx.fillStyle = "rgba(7,9,10,0.72)";
    ctx.beginPath();
    ctx.roundRect(w / 2 - cueWidth / 2, h * 0.91, cueWidth, 30, 15);
    ctx.fill();
    ctx.fillStyle = status;
    ctx.fillText(cue, w / 2, h * 0.91 + 15);
  }
  ctx.restore();
}

/** Simple green instructor figure: no clothing or anatomy details, only the
 * moving body segments and joints a beginner needs to follow. */
export function drawInstructorAvatar(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  w: number,
  h: number,
  opts: { mirror?: boolean; postureColor?: string; fit?: boolean },
) {
  const { mirror = false, postureColor = "#5ee9a0", fit = false } = opts;
  const xOf = (lm: Landmark) => (mirror ? 1 - lm.x : lm.x) * w;
  const yOf = (lm: Landmark) => (fit ? 0.08 + lm.y * 0.62 : lm.y) * h;
  const p = (index: number) => landmarks[index];
  const point = (index: number) => {
    const lm = p(index);
    const rawX = xOf(lm);
    const isFarSide = [11, 13, 15, 23, 25, 27, 31].includes(index);
    const projectedX = isFarSide ? w * 0.5 + (rawX - w * 0.5) * 0.65 : rawX;
    return { x: projectedX, y: yOf(lm) };
  };
  const between = (a: number, b: number) => {
    const from = point(a);
    const to = point(b);
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  };
  const line = (a: number, b: number, width: number, color = "#53e68f") => {
    const from = point(a);
    const to = point(b);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  ctx.save();
  const green = postureColor === "#f07167" ? "#53e68f" : postureColor;
  const glow = "rgba(83,230,143,0.55)";
  ctx.shadowColor = glow;
  ctx.shadowBlur = Math.max(8, w * 0.018);

  // A slim, upright 3/4 body: the far side is compressed to create depth.
  const shoulderCenter = between(11, 12);
  const hipCenter = between(23, 24);
  const shoulderLeft = point(11);
  const shoulderRight = point(12);
  const hipLeft = point(23);
  const hipRight = point(24);
  // A soft, tapered torso makes the figure human without clothing details.
  ctx.fillStyle = "rgba(83,230,143,0.28)";
  ctx.strokeStyle = green;
  ctx.lineWidth = Math.max(2, w * 0.005);
  ctx.beginPath();
  ctx.moveTo(shoulderLeft.x, shoulderLeft.y);
  ctx.quadraticCurveTo(shoulderCenter.x, shoulderCenter.y - h * 0.012, shoulderRight.x, shoulderRight.y);
  ctx.lineTo(hipRight.x, hipRight.y);
  ctx.quadraticCurveTo(hipCenter.x, hipCenter.y + h * 0.012, hipLeft.x, hipLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = green;
  ctx.lineWidth = Math.max(5, w * 0.012);
  ctx.lineCap = "round";
  ctx.moveTo(shoulderCenter.x, shoulderCenter.y);
  ctx.lineTo(hipCenter.x, hipCenter.y);
  ctx.stroke();
  const head = point(0);
  const headRadius = Math.max(18, w * 0.042);
  ctx.beginPath();
  ctx.strokeStyle = green;
  ctx.lineWidth = Math.max(5, w * 0.012);
  ctx.moveTo(head.x, head.y + headRadius * 0.8);
  ctx.lineTo(shoulderCenter.x, shoulderCenter.y);
  ctx.stroke();
  line(11, 13, Math.max(9, w * 0.026), green);
  line(13, 15, Math.max(9, w * 0.026), green);
  line(12, 14, Math.max(9, w * 0.026), green);
  line(14, 16, Math.max(9, w * 0.026), green);
  line(23, 25, Math.max(10, w * 0.03), green);
  line(25, 27, Math.max(10, w * 0.03), green);
  line(24, 26, Math.max(10, w * 0.03), green);
  line(26, 28, Math.max(10, w * 0.03), green);
  line(27, 31, Math.max(6, w * 0.015), green);
  line(28, 32, Math.max(6, w * 0.015), green);

  ctx.shadowBlur = 0;
  const jointRadius = Math.max(6, w * 0.014);
  for (const index of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
    const joint = point(index);
    ctx.fillStyle = green;
    ctx.beginPath();
    ctx.arc(joint.x, joint.y, jointRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // A simple face makes the viewing direction unmistakable.
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = Math.max(1.5, w * 0.003);
  ctx.beginPath();
  ctx.arc(head.x, head.y, headRadius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(7,9,10,0.8)";
  ctx.beginPath();
  ctx.arc(head.x + headRadius * 0.1, head.y - headRadius * 0.18, 2.4, 0, Math.PI * 2);
  ctx.arc(head.x + headRadius * 0.42, head.y - headRadius * 0.14, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(7,9,10,0.8)";
  ctx.lineWidth = Math.max(1.5, w * 0.003);
  ctx.moveTo(head.x + headRadius * 0.48, head.y - headRadius * 0.03);
  ctx.lineTo(head.x + headRadius * 0.72, head.y + headRadius * 0.04);
  ctx.lineTo(head.x + headRadius * 0.45, head.y + headRadius * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(head.x + headRadius * 0.28, head.y + headRadius * 0.36, headRadius * 0.2, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.restore();
}
