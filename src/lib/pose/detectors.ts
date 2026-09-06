import type { DetectorKind } from "@/lib/exercises/types";
import { FULL_BODY, angle, bodyLineDeg, clamp, dist, mid, requiredVisible, torsoTiltDeg } from "./geometry";
import { LM, type Detector, type DetectorOutput, type FormIssue, type PoseFrame } from "./types";

function empty(partial: Partial<DetectorOutput> = {}): DetectorOutput {
  return {
    reps: 0,
    holdSec: 0,
    phase: "idle",
    formScore: 0,
    issues: [],
    angles: {},
    muscles: [],
    cue: "Entra en el encuadre de cuerpo completo",
    ready: false,
    readyHint: "Aléjate un poco. Deben verse cabeza, cadera y pies.",
    ...partial,
  };
}

function scoreFrom(issues: FormIssue[], bonus = 0): number {
  const penalty = issues.reduce((s, i) => s + (i.severity === "danger" ? 22 : i.severity === "warn" ? 14 : 6), 0);
  return clamp(Math.round(100 - penalty + bonus), 0, 100);
}

function squatLike(muscles: string[], extra?: (frame: PoseFrame, knee: number) => FormIssue[]): Detector {
  let phase: "up" | "down" = "up";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "up";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, FULL_BODY)) return empty({ reps, phase });
      const lKnee = angle(p[LM.leftHip], p[LM.leftKnee], p[LM.leftAnkle]);
      const rKnee = angle(p[LM.rightHip], p[LM.rightKnee], p[LM.rightAnkle]);
      const knee = (lKnee + rKnee) / 2;
      const lHip = angle(p[LM.leftShoulder], p[LM.leftHip], p[LM.leftKnee]);
      const rHip = angle(p[LM.rightShoulder], p[LM.rightHip], p[LM.rightKnee]);
      const hip = (lHip + rHip) / 2;
      const issues: FormIssue[] = extra?.(frame, knee) ?? [];

      const kneeWidth = dist(p[LM.leftKnee], p[LM.rightKnee]);
      const ankleWidth = dist(p[LM.leftAnkle], p[LM.rightAnkle]);
      if (knee < 150 && kneeWidth < ankleWidth * 0.82) {
        issues.push({
          code: "knee-cave",
          message: "Rodillas hacia dentro",
          fix: "Empuja las rodillas en la dirección de los pies.",
          risk: "Valgo de rodilla: menisco y ligamento colateral.",
          severity: "danger",
        });
      }

      const tilt = Math.abs(torsoTiltDeg(p));
      if (tilt > 28 && knee < 150) {
        issues.push({
          code: "torso-lean",
          message: "Tronco demasiado inclinado",
          fix: "Saca pecho y empuja las caderas atrás, no los hombros adelante.",
          risk: "Carga lumbar innecesaria.",
          severity: "warn",
        });
      }

      const heelLift =
        p[LM.leftHeel] && p[LM.leftFoot] && p[LM.leftHeel].y + 0.012 < p[LM.leftFoot].y;
      if (heelLift && knee < 140) {
        issues.push({
          code: "heels",
          message: "Talones levantados",
          fix: "Acorta el descenso o abre un poco la stance.",
          risk: "Sobrecarga de rodilla y pérdida de equilibrio.",
          severity: "warn",
        });
      }

      if (phase === "up" && knee < 105) phase = "down";
      if (phase === "down" && knee > 158) {
        phase = "up";
        reps += 1;
      }

      const depthCue = knee > 140 ? "Desciende con control" : knee > 110 ? "Un poco más de profundidad" : "Empuja el suelo y sube";
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues, knee < 100 ? 4 : 0),
        issues,
        angles: { knee: Math.round(knee), hip: Math.round(hip) },
        muscles,
        cue: issues[0]?.fix ?? depthCue,
        ready: true,
        readyHint: "",
      };
    },
  };
}

function pushupLike(muscles: string[]): Detector {
  let phase: "up" | "down" = "up";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "up";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      const idxs = [LM.leftShoulder, LM.rightShoulder, LM.leftElbow, LM.rightElbow, LM.leftWrist, LM.rightWrist, LM.leftHip, LM.rightHip];
      if (!requiredVisible(p, idxs)) return empty({ reps, phase });
      const lElb = angle(p[LM.leftShoulder], p[LM.leftElbow], p[LM.leftWrist]);
      const rElb = angle(p[LM.rightShoulder], p[LM.rightElbow], p[LM.rightWrist]);
      const elbow = (lElb + rElb) / 2;
      const line = bodyLineDeg(p);
      const issues: FormIssue[] = [];

      if (line > 22) {
        issues.push({
          code: "sag",
          message: "La cadera se hunde o se eleva",
          fix: "Aprieta glúteos y alinea hombros, cadera y tobillos.",
          risk: "Compresión lumbar o pérdida de pecho.",
          severity: "danger",
        });
      }

      const shoulderWidth = dist(p[LM.leftShoulder], p[LM.rightShoulder]);
      const elbowWidth = dist(p[LM.leftElbow], p[LM.rightElbow]);
      if (elbow < 140 && elbowWidth > shoulderWidth * 1.55) {
        issues.push({
          code: "flared",
          message: "Codos demasiado abiertos",
          fix: "Acerca los codos al torso, unos 45°.",
          risk: "Impingement de hombro.",
          severity: "warn",
        });
      }

      if (phase === "up" && elbow < 95) phase = "down";
      if (phase === "down" && elbow > 155) {
        phase = "up";
        reps += 1;
      }

      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: { elbow: Math.round(elbow), line: Math.round(line) },
        muscles,
        cue: issues[0]?.fix ?? (elbow > 140 ? "Desciende el pecho al suelo" : "Empuja el suelo lejos"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function lungeDetector(): Detector {
  let phase: "up" | "down" = "up";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "up";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, FULL_BODY)) return empty({ reps, phase });
      const lKnee = angle(p[LM.leftHip], p[LM.leftKnee], p[LM.leftAnkle]);
      const rKnee = angle(p[LM.rightHip], p[LM.rightKnee], p[LM.rightAnkle]);
      const front = Math.min(lKnee, rKnee);
      const split = Math.abs(p[LM.leftAnkle].x - p[LM.rightAnkle].x);
      const issues: FormIssue[] = [];
      const tilt = Math.abs(torsoTiltDeg(p));
      if (tilt > 22) {
        issues.push({
          code: "lean",
          message: "Tronco caído hacia delante",
          fix: "Pecho alto. La cadera baja, no el pecho.",
          risk: "Rodilla delantera y lumbar.",
          severity: "warn",
        });
      }
      if (split < 0.12) {
        issues.push({
          code: "short",
          message: "Paso demasiado corto",
          fix: "Alarga el paso para que la tibia delantera quede más vertical.",
          risk: "Sobrecarga femoropatelar.",
          severity: "info",
        });
      }
      if (phase === "up" && front < 110) phase = "down";
      if (phase === "down" && front > 155) {
        phase = "up";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: { frontKnee: Math.round(front) },
        muscles: ["Cuádriceps", "Glúteos", "Core"],
        cue: issues[0]?.fix ?? (front > 140 ? "Baja la rodilla trasera" : "Empuja con el talón delantero"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function holdDetector(opts: {
  muscles: string[];
  good: (frame: PoseFrame) => { ok: boolean; issues: FormIssue[]; angles: Record<string, number>; cue: string };
}): Detector {
  let holdSec = 0;
  let lastTs = 0;
  return {
    kind: "hold",
    reset() {
      holdSec = 0;
      lastTs = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, [LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip])) {
        lastTs = frame.timestamp;
        return empty({ holdSec, phase: "hold" });
      }
      const g = opts.good(frame);
      if (lastTs) {
        const dt = Math.min(0.25, (frame.timestamp - lastTs) / 1000);
        if (g.ok) holdSec += dt;
      }
      lastTs = frame.timestamp;
      return {
        reps: 0,
        holdSec,
        phase: g.ok ? "hold" : "adjust",
        formScore: scoreFrom(g.issues, g.ok ? 8 : -10),
        issues: g.issues,
        angles: g.angles,
        muscles: opts.muscles,
        cue: g.cue,
        ready: true,
        readyHint: "",
      };
    },
  };
}

function curlDetector(): Detector {
  let phase: "down" | "up" = "down";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "down";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      const idxs = [LM.leftShoulder, LM.rightShoulder, LM.leftElbow, LM.rightElbow, LM.leftWrist, LM.rightWrist];
      if (!requiredVisible(p, idxs)) return empty({ reps, phase });
      const l = angle(p[LM.leftShoulder], p[LM.leftElbow], p[LM.leftWrist]);
      const r = angle(p[LM.rightShoulder], p[LM.rightElbow], p[LM.rightWrist]);
      const elbow = (l + r) / 2;
      const issues: FormIssue[] = [];
      const lTravel = Math.abs(p[LM.leftElbow].x - p[LM.leftShoulder].x);
      const rTravel = Math.abs(p[LM.rightElbow].x - p[LM.rightShoulder].x);
      if (lTravel > 0.08 || rTravel > 0.08) {
        issues.push({
          code: "elbow-travel",
          message: "Los codos se adelantan",
          fix: "Clava los codos a las costillas. Solo se mueve el antebrazo.",
          risk: "Menos bíceps, más deltoides anterior.",
          severity: "warn",
        });
      }
      const tilt = Math.abs(torsoTiltDeg(p));
      if (tilt > 16) {
        issues.push({
          code: "swing",
          message: "Balanceo de tronco",
          fix: "Reduce el peso. Glúteos y costillas firmes.",
          risk: "Lumbar.",
          severity: "danger",
        });
      }
      if (phase === "down" && elbow < 55) phase = "up";
      if (phase === "up" && elbow > 150) {
        phase = "down";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: { elbow: Math.round(elbow) },
        muscles: ["Bíceps", "Braquial"],
        cue: issues[0]?.fix ?? (elbow > 120 ? "Sube sin balancear" : "Baja en 2–3 segundos"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function pressDetector(): Detector {
  let phase: "down" | "up" = "down";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "down";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      const idxs = [LM.leftShoulder, LM.rightShoulder, LM.leftElbow, LM.rightElbow, LM.leftWrist, LM.rightWrist, LM.leftHip, LM.rightHip];
      if (!requiredVisible(p, idxs)) return empty({ reps, phase });
      const wristsY = (p[LM.leftWrist].y + p[LM.rightWrist].y) / 2;
      const headY = p[0]?.y ?? 0.2;
      const issues: FormIssue[] = [];
      const tilt = Math.abs(torsoTiltDeg(p));
      if (tilt > 18) {
        issues.push({
          code: "arch",
          message: "Lumbar arqueada para terminar el press",
          fix: "Aprieta glúteos y costillas. Recorta el rango si hace falta.",
          risk: "Compresión lumbar y pinzamiento de hombro.",
          severity: "danger",
        });
      }
      const overhead = wristsY < headY - 0.02;
      if (phase === "down" && overhead) phase = "up";
      if (phase === "up" && wristsY > (p[LM.leftShoulder].y + p[LM.rightShoulder].y) / 2) {
        phase = "down";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: { tilt: Math.round(tilt) },
        muscles: ["Deltoides", "Tríceps", "Core"],
        cue: issues[0]?.fix ?? (overhead ? "Baja con control a los hombros" : "Empuja vertical, no hacia delante"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function hingeDetector(): Detector {
  let phase: "up" | "down" = "up";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "up";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, FULL_BODY)) return empty({ reps, phase });
      const lHip = angle(p[LM.leftShoulder], p[LM.leftHip], p[LM.leftKnee]);
      const rHip = angle(p[LM.rightShoulder], p[LM.rightHip], p[LM.rightKnee]);
      const hip = (lHip + rHip) / 2;
      const lKnee = angle(p[LM.leftHip], p[LM.leftKnee], p[LM.leftAnkle]);
      const rKnee = angle(p[LM.rightHip], p[LM.rightKnee], p[LM.rightAnkle]);
      const knee = (lKnee + rKnee) / 2;
      const issues: FormIssue[] = [];
      if (knee < 140) {
        issues.push({
          code: "squat-hinge",
          message: "Se está convirtiendo en sentadilla",
          fix: "Tibia vertical. Empuja la cadera atrás, no dobles tanto la rodilla.",
          risk: "Pierdes el estímulo de isquios.",
          severity: "warn",
        });
      }
      const shoulderHip = dist(mid(p[LM.leftShoulder], p[LM.rightShoulder]), mid(p[LM.leftHip], p[LM.rightHip]));
      if (hip < 130 && shoulderHip < 0.18) {
        issues.push({
          code: "round",
          message: "Espalda redondeada",
          fix: "Pecho largo. Acorta el rango hasta mantener la lumbar neutra.",
          risk: "Distensión o hernia lumbar.",
          severity: "danger",
        });
      }
      if (phase === "up" && hip < 125) phase = "down";
      if (phase === "down" && hip > 160) {
        phase = "up";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: { hip: Math.round(hip), knee: Math.round(knee) },
        muscles: ["Isquiotibiales", "Glúteos", "Erectores"],
        cue: issues[0]?.fix ?? (hip > 150 ? "Empuja la cadera atrás" : "Aprieta glúteos y vuelve"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function crunchDetector(): Detector {
  let phase: "down" | "up" = "down";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "down";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, [LM.nose, LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip])) {
        return empty({ reps, phase });
      }
      const shoulderY = (p[LM.leftShoulder].y + p[LM.rightShoulder].y) / 2;
      const hipY = (p[LM.leftHip].y + p[LM.rightHip].y) / 2;
      const lift = hipY - shoulderY;
      const issues: FormIssue[] = [];
      const nose = p[LM.nose];
      const neck = dist(nose, mid(p[LM.leftShoulder], p[LM.rightShoulder]));
      if (neck < 0.08) {
        issues.push({
          code: "neck",
          message: "Estás tirando del cuello",
          fix: "Mantén un puño entre mentón y pecho. Enrolla el tórax, no la cabeza.",
          risk: "Cervicalgia.",
          severity: "danger",
        });
      }
      if (phase === "down" && lift > 0.12) phase = "up";
      if (phase === "up" && lift < 0.06) {
        phase = "down";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: { lift: Math.round(lift * 100) },
        muscles: ["Recto abdominal", "Oblicuos"],
        cue: issues[0]?.fix ?? (phase === "down" ? "Enrolla el pecho hacia las caderas" : "Baja vertebra a vertebra"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function jacksDetector(): Detector {
  let phase: "in" | "out" = "in";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "in";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, [...FULL_BODY, LM.leftWrist, LM.rightWrist])) return empty({ reps, phase });
      const ankleW = dist(p[LM.leftAnkle], p[LM.rightAnkle]);
      const wristY = (p[LM.leftWrist].y + p[LM.rightWrist].y) / 2;
      const open = ankleW > 0.28 && wristY < p[LM.leftShoulder].y;
      if (phase === "in" && open) phase = "out";
      if (phase === "out" && ankleW < 0.16) {
        phase = "in";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: 92,
        issues: [],
        angles: { stance: Math.round(ankleW * 100) },
        muscles: ["Gemelos", "Hombros", "Aductores"],
        cue: open ? "Aterriza suave" : "Abre brazos y piernas a la vez",
        ready: true,
        readyHint: "",
      };
    },
  };
}

function climberDetector(): Detector {
  let lastSide: "L" | "R" | null = null;
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      lastSide = null;
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, FULL_BODY)) return empty({ reps });
      const lKneeY = p[LM.leftKnee].y;
      const rKneeY = p[LM.rightKnee].y;
      const hipY = (p[LM.leftHip].y + p[LM.rightHip].y) / 2;
      const line = bodyLineDeg(p);
      const issues: FormIssue[] = [];
      if (line > 25) {
        issues.push({
          code: "bounce",
          message: "La cadera rebota",
          fix: "Reduce la velocidad. Es una plancha que camina.",
          risk: "Lumbar y muñecas.",
          severity: "warn",
        });
      }
      const leftUp = lKneeY < hipY + 0.04;
      const rightUp = rKneeY < hipY + 0.04;
      if (leftUp && lastSide !== "L") {
        if (lastSide === "R") reps += 1;
        lastSide = "L";
      } else if (rightUp && lastSide !== "R") {
        if (lastSide === "L") reps += 1;
        lastSide = "R";
      }
      return {
        reps,
        holdSec: 0,
        phase: leftUp ? "L" : rightUp ? "R" : "plank",
        formScore: scoreFrom(issues),
        issues,
        angles: { line: Math.round(line) },
        muscles: ["Core", "Psoas", "Hombros"],
        cue: issues[0]?.fix ?? "Rodilla al pecho, cadera quieta",
        ready: true,
        readyHint: "",
      };
    },
  };
}

function calfDetector(): Detector {
  let phase: "down" | "up" = "down";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "down";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, [LM.leftAnkle, LM.rightAnkle, LM.leftKnee, LM.rightKnee, LM.leftHip, LM.rightHip])) {
        return empty({ reps, phase });
      }
      const ankleY = (p[LM.leftAnkle].y + p[LM.rightAnkle].y) / 2;
      const kneeY = (p[LM.leftKnee].y + p[LM.rightKnee].y) / 2;
      const rise = kneeY - ankleY;
      if (phase === "down" && rise > 0.16) phase = "up";
      if (phase === "up" && rise < 0.12) {
        phase = "down";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: 90,
        issues: [],
        angles: { rise: Math.round(rise * 100) },
        muscles: ["Gastrocnemio", "Sóleo"],
        cue: phase === "up" ? "Pausa 1 s arriba" : "Sube al máximo sin rebotar",
        ready: true,
        readyHint: "",
      };
    },
  };
}

function burpeeDetector(): Detector {
  let stage: "stand" | "fold" | "plank" | "fold2" = "stand";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      stage = "stand";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, FULL_BODY)) return empty({ reps, phase: stage });
      const hipY = (p[LM.leftHip].y + p[LM.rightHip].y) / 2;
      const shoulderY = (p[LM.leftShoulder].y + p[LM.rightShoulder].y) / 2;
      const wristY = (p[LM.leftWrist].y + p[LM.rightWrist].y) / 2;
      const standing = hipY < 0.62 && shoulderY < 0.45;
      const plankish = hipY > 0.55 && Math.abs(shoulderY - hipY) < 0.18;
      const folded = wristY > 0.7 && hipY > 0.45;
      if (stage === "stand" && folded) stage = "fold";
      else if (stage === "fold" && plankish) stage = "plank";
      else if (stage === "plank" && folded) stage = "fold2";
      else if (stage === "fold2" && standing) {
        stage = "stand";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase: stage,
        formScore: 84,
        issues: [],
        angles: {},
        muscles: ["Cuerpo completo"],
        cue:
          stage === "stand"
            ? "Manos al suelo"
            : stage === "fold"
              ? "Pies atrás, cuerpo largo"
              : stage === "plank"
                ? "Pies delante"
                : "Levántate y salta",
        ready: true,
        readyHint: "",
      };
    },
  };
}

function hipThrustDetector(): Detector {
  let phase: "down" | "up" = "down";
  let reps = 0;
  return {
    kind: "rep",
    reset() {
      phase = "down";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, [LM.leftHip, LM.rightHip, LM.leftKnee, LM.rightKnee, LM.leftShoulder, LM.rightShoulder])) {
        return empty({ reps, phase });
      }
      const hipY = (p[LM.leftHip].y + p[LM.rightHip].y) / 2;
      const shoulderY = (p[LM.leftShoulder].y + p[LM.rightShoulder].y) / 2;
      const issues: FormIssue[] = [];
      if (hipY + 0.04 < shoulderY) {
        issues.push({
          code: "overext",
          message: "Estás hiperextendiendo la lumbar",
          fix: "Costillas abajo. Empuja el pubis, no mires al techo.",
          risk: "Extensión lumbar excesiva.",
          severity: "warn",
        });
      }
      if (phase === "down" && hipY < shoulderY + 0.02) phase = "up";
      if (phase === "up" && hipY > shoulderY + 0.1) {
        phase = "down";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: scoreFrom(issues),
        issues,
        angles: {},
        muscles: ["Glúteo mayor", "Isquiotibiales"],
        cue: issues[0]?.fix ?? (phase === "down" ? "Empuja el pubis al techo" : "Baja con control"),
        ready: true,
        readyHint: "",
      };
    },
  };
}

function genericDetector(muscles: string[]): Detector {
  let phase: "low" | "high" = "high";
  let reps = 0;
  let ema = 0.5;
  return {
    kind: "rep",
    reset() {
      phase = "high";
      reps = 0;
    },
    onFrame(frame) {
      const p = frame.landmarks;
      if (!requiredVisible(p, [LM.leftHip, LM.rightHip, LM.leftShoulder, LM.rightShoulder])) {
        return empty({ reps, phase });
      }
      const y = (p[LM.leftHip].y + p[LM.rightHip].y + p[LM.leftWrist].y + p[LM.rightWrist].y) / 4;
      ema = ema * 0.8 + y * 0.2;
      if (phase === "high" && ema > 0.58) phase = "low";
      if (phase === "low" && ema < 0.48) {
        phase = "high";
        reps += 1;
      }
      return {
        reps,
        holdSec: 0,
        phase,
        formScore: 80,
        issues: [],
        angles: {},
        muscles,
        cue: "Movimiento detectado. Controla cada repetición.",
        ready: true,
        readyHint: "",
      };
    },
  };
}

export function createDetector(kind: DetectorKind, muscles: string[]): Detector {
  switch (kind) {
    case "squat":
      return squatLike(muscles);
    case "pushup":
      return pushupLike(muscles);
    case "lunge":
      return lungeDetector();
    case "plank":
      return holdDetector({
        muscles,
        good: (frame) => {
          const line = bodyLineDeg(frame.landmarks);
          const issues: FormIssue[] = [];
          if (line > 18) {
            issues.push({
              code: "line",
              message: "Línea rota",
              fix: "Aprieta glúteos y cierra las costillas.",
              risk: "Lumbar.",
              severity: "danger",
            });
          }
          return {
            ok: line <= 18,
            issues,
            angles: { line: Math.round(line) },
            cue: issues[0]?.fix ?? "Empuja el suelo. Cuerpo largo.",
          };
        },
      });
    case "wallsit":
      return holdDetector({
        muscles,
        good: (frame) => {
          const p = frame.landmarks;
          const lKnee = angle(p[LM.leftHip], p[LM.leftKnee], p[LM.leftAnkle]);
          const rKnee = angle(p[LM.rightHip], p[LM.rightKnee], p[LM.rightAnkle]);
          const knee = (lKnee + rKnee) / 2;
          const issues: FormIssue[] = [];
          if (knee > 120) {
            issues.push({
              code: "high",
              message: "Todavía estás demasiado alto",
              fix: "Baja hasta muslos paralelos, espalda plana en la pared.",
              risk: "Menos estímulo, más rodilla si te adelantas.",
              severity: "info",
            });
          }
          return {
            ok: knee < 115,
            issues,
            angles: { knee: Math.round(knee) },
            cue: issues[0]?.fix ?? "Peso en talones. Respira.",
          };
        },
      });
    case "curl":
      return curlDetector();
    case "press":
      return pressDetector();
    case "hinge":
      return hingeDetector();
    case "crunch":
      return crunchDetector();
    case "jacks":
      return jacksDetector();
    case "climber":
      return climberDetector();
    case "calfraise":
      return calfDetector();
    case "burpee":
      return burpeeDetector();
    case "hipthrust":
      return hipThrustDetector();
    default:
      return genericDetector(muscles);
  }
}
