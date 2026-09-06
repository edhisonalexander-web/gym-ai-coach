import type { Landmark } from "./types";

type PoseLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    ts: number,
  ) => { landmarks?: Array<Array<{ x: number; y: number; z: number; visibility?: number }>> };
  close?: () => void;
};

let landmarkerPromise: Promise<PoseLandmarkerLike | null> | null = null;

export function loadPoseLandmarker(): Promise<PoseLandmarkerLike | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      try {
        const url = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/+esm";
        const mod = (await import(/* @vite-ignore */ url)) as {
          PoseLandmarker: {
            createFromOptions: (vision: unknown, opts: unknown) => Promise<PoseLandmarkerLike>;
          };
          FilesetResolver: {
            forVisionTasks: (p: string) => Promise<unknown>;
          };
        };
        const { PoseLandmarker, FilesetResolver } = mod;
        const wasmRoot = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
        const vision = await FilesetResolver.forVisionTasks(wasmRoot);
        const model =
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
        try {
          return await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: model, delegate: "GPU" },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch {
          return await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: model, delegate: "CPU" },
            runningMode: "VIDEO",
            numPoses: 1,
          });
        }
      } catch (err) {
        console.warn("[pose] MediaPipe no disponible", err);
        return null;
      }
    })();
  }
  return landmarkerPromise;
}

export function landmarksFromResult(
  result: { landmarks?: Array<Array<{ x: number; y: number; z: number; visibility?: number }>> } | null,
): Landmark[] | null {
  const raw = result?.landmarks?.[0];
  if (!raw?.length) return null;
  return raw.map((p) => ({
    x: p.x,
    y: p.y,
    z: p.z ?? 0,
    visibility: p.visibility ?? 0.9,
  }));
}
