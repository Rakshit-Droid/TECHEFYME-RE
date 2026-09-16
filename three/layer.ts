import type { Camera, Scene, WebGLRenderer } from "three";
import { createRenderer, disposeRenderer } from "./renderer";
import { detectQuality, hasWebGL, type Quality } from "./quality";

/**
 * What an effect gives the layer: something to draw, and hooks for size and time.
 * Effects build their own scene from the quality tier they are handed.
 */
export type Effect = {
  scene: Scene;
  camera: Camera;
  /** Internal render size changed. `width`/`height` are the drawing-buffer pixels; `cssWidth`/`cssHeight` the element's. */
  resize: (width: number, height: number, cssWidth: number, cssHeight: number) => void;
  /** Called before each draw. `time` in seconds since the effect started; `dt` since the last draw. */
  update: (time: number, dt: number) => void;
  dispose: () => void;
};

export type LayerOptions = {
  /** The effect's own frame-rate cap; the device tier may lower it further. */
  maxFps?: number;
  /**
   * What to do under prefers-reduced-motion. "play" keeps the loop running (this site's
   * client turns motion off at the OS level and still wants it), "still" draws one frame.
   */
  reducedMotion?: "play" | "still";
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
};

export type Layer = {
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  quality: Quality;
  dispose: () => void;
};

/**
 * Mounts an effect into a host element and owns its whole life: a fresh canvas, the
 * renderer, sizing at the tier's render scale, a frame-capped loop that only runs while
 * the host is on screen and the tab is visible, and a cleanup that frees the GPU.
 *
 * The canvas is created here rather than rendered by React so a remount always gets a
 * new context: a canvas whose context was lost hands the same dead context back.
 */
export function mountLayer(host: HTMLElement, build: (quality: Quality) => Effect, options: LayerOptions = {}): Layer | null {
  if (!hasWebGL()) return null;
  const quality = detectQuality();

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
  host.appendChild(canvas);

  const renderer = createRenderer(canvas);
  if (!renderer) {
    canvas.remove();
    return null;
  }

  const effect = build(quality);
  const frameMs = 1000 / Math.min(quality.fps, options.maxFps ?? Infinity);
  const still = options.reducedMotion === "still" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let raf = 0;
  let visible = false;
  let lost = false;
  let ready = false;
  let last = 0;
  let lastDraw = 0;
  const start = performance.now();

  const draw = (now: number) => {
    const t = (now - start) / 1000;
    effect.update(t, lastDraw ? t - lastDraw : 0);
    lastDraw = t;
    renderer.render(effect.scene, effect.camera);
    if (!ready) {
      ready = true;
      options.onReady?.();
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden || lost) return;
    // One frame is all a still layer draws.
    if (still && ready) return;
    raf = requestAnimationFrame(frame);
    if (now - last < frameMs) return;
    last = now;
    draw(now);
  };
  const kick = () => {
    if (!raf && visible && !document.hidden && !lost) raf = requestAnimationFrame(frame);
  };

  const resize = () => {
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const w = Math.max(1, Math.round(cssW * quality.renderScale));
    const h = Math.max(1, Math.round(cssH * quality.renderScale));
    renderer.setSize(w, h, false);
    effect.resize(w, h, cssW, cssH);
    // Keep the picture current while the element is being resized, whether or not the loop runs.
    if (!lost) draw(performance.now());
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    kick();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", kick);

  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    lost = false;
    resize();
    kick();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  return {
    canvas,
    renderer,
    quality,
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      effect.dispose();
      disposeRenderer(renderer);
      canvas.remove();
    },
  };
}
