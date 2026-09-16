import { Vector2 } from "three";
import { mountLayer, type Effect, type Layer } from "../layer";
import { createScreenQuad } from "../screen-quad";
import { PORTAL_FRAGMENT } from "../shaders/portal";

/** How far the light leans toward the pointer: 0 ignores it, 1 follows it outright. */
const POINTER_PULL = 0.35;
/** Seconds for the light to settle on a new pointer direction. */
const POINTER_TAU = 0.6;

/**
 * The testimonials backdrop. Starts twenty seconds into its cycle so the ring is already
 * mid-shape on arrival, and leans its light gently toward a fine pointer moving over
 * `pointerScope` (the section), settling back when the pointer leaves.
 */
export function mountPortalField(host: HTMLElement, pointerScope: HTMLElement | null): Layer | null {
  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uCenter: { value: new Vector2(0.4, 0.46) },
    uTime: { value: 20 },
    uPointer: { value: new Vector2(-1, 0) },
    uPointerMix: { value: 0 },
  };

  // Pointer, in the shader's own space: centred on the ring, scaled by the short side.
  const target = new Vector2(-1, 0);
  let targetMix = 0;
  let css = { w: 1, h: 1 };
  let rect: DOMRect | null = null;

  // The layer applies the device tier (render scale, frame cap); this effect has no tiers of its own.
  const build = (): Effect => {
    const quad = createScreenQuad(PORTAL_FRAGMENT, uniforms);
    return {
      scene: quad.scene,
      camera: quad.camera,
      resize: (w, h, cssW, cssH) => {
        uniforms.uRes.value.set(w, h);
        css = { w: cssW, h: cssH };
        rect = null;
        // Off to the left on wide screens, centred and a little high on narrow ones.
        const wide = cssW >= 768;
        uniforms.uCenter.value.set(wide ? 0.4 : 0.5, wide ? 0.46 : 0.62);
      },
      update: (time, dt) => {
        uniforms.uTime.value = 20 + time;
        if (dt > 0) {
          const k = 1 - Math.exp(-dt / POINTER_TAU);
          uniforms.uPointer.value.lerp(target, k).normalize();
          uniforms.uPointerMix.value += (targetMix - uniforms.uPointerMix.value) * k;
        }
      },
      dispose: quad.dispose,
    };
  };

  const layer = mountLayer(host, build, {
    maxFps: 30,
    reducedMotion: "play",
    onReady: () => {
      host.dataset.ready = "";
    },
  });
  if (!layer) return null;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const scope = fine ? pointerScope : null;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    rect ??= layer.canvas.getBoundingClientRect();
    const scale = Math.min(css.w, css.h);
    const cx = rect.left + css.w * uniforms.uCenter.value.x;
    // The shader's y runs upward from the bottom edge; the page's runs down from the top.
    const cy = rect.top + css.h * (1 - uniforms.uCenter.value.y);
    target.set((e.clientX - cx) / scale, (cy - e.clientY) / scale);
    if (target.lengthSq() < 1e-6) return;
    target.normalize();
    targetMix = POINTER_PULL;
  };
  const onLeave = () => {
    targetMix = 0;
  };
  const onScroll = () => {
    rect = null;
  };
  scope?.addEventListener("pointermove", onMove, { passive: true });
  scope?.addEventListener("pointerleave", onLeave);
  if (scope) window.addEventListener("scroll", onScroll, { passive: true });

  return {
    ...layer,
    dispose: () => {
      scope?.removeEventListener("pointermove", onMove);
      scope?.removeEventListener("pointerleave", onLeave);
      if (scope) window.removeEventListener("scroll", onScroll);
      delete host.dataset.ready;
      layer.dispose();
    },
  };
}
