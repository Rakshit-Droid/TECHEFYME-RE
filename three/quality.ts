/**
 * Which tier of WebGL work this device gets. Phones and small machines render at a
 * lower internal resolution and frame rate; the effect itself is the same everywhere.
 */
export type Quality = {
  tier: "low" | "high";
  /** Internal render size as a share of the CSS size (1 = full). */
  renderScale: number;
  /** Frames a second the loop is capped at. */
  fps: number;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

export function detectQuality(): Quality {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.matchMedia("(max-width: 767px)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;
  const low = (coarse && small) || cores <= 2 || memory <= 2;
  return low ? { tier: "low", renderScale: 0.4, fps: 24 } : { tier: "high", renderScale: 0.5, fps: 30 };
}

/** True when the browser can give us a WebGL context at all. */
export function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
