import { FILM } from "@/lib/hero-gate";

const MAX_X = 12; // px either side
const MAX_Y = 10;
const TAU = 140; // ms — first-order smoothing, no overshoot
const SCALE = "scale(1.03)"; // covers ±12/±10px at the 1024×700 minimum

/**
 * Subtle cursor parallax on the hero media wrapper. Refs and DOM only:
 * no React state, no GSAP. The loop runs only while the layer is still settling.
 */
export function createParallax(section: HTMLElement, wrap: HTMLElement) {
  const mq = window.matchMedia(FILM);
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  let last = 0;
  let attached = false;
  let stopped = false;

  const write = () => {
    wrap.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ${SCALE}`;
  };

  const loop = (t: number) => {
    const dt = last ? Math.min(t - last, 64) : 16;
    last = t;
    const k = 1 - Math.exp(-dt / TAU);
    x += (targetX - x) * k;
    y += (targetY - y) * k;
    write();
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.05) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
      last = 0;
    }
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  // Cursor right → media moves slightly right; cursor up → media moves slightly up.
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    targetX = (e.clientX / window.innerWidth - 0.5) * 2 * MAX_X;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2 * MAX_Y;
    kick();
  };

  const toNeutral = () => {
    targetX = 0;
    targetY = 0;
    kick();
  };

  const onLeave = (e: PointerEvent) => {
    // The fixed nav sits above the hero but is not inside it; crossing into it is not leaving.
    const next = e.relatedTarget as Element | null;
    if (next?.closest?.("[data-site-header]")) return;
    toNeutral();
  };

  const attach = () => {
    if (attached || stopped) return;
    attached = true;
    wrap.style.willChange = "transform";
    write();
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerleave", toNeutral);
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    section.removeEventListener("pointermove", onMove);
    section.removeEventListener("pointerleave", onLeave);
    document.documentElement.removeEventListener("pointerleave", toNeutral);
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    x = y = targetX = targetY = 0;
    wrap.style.transform = "";
    wrap.style.willChange = "";
  };

  const onQuery = () => (mq.matches ? attach() : detach());

  if (mq.matches) attach();
  mq.addEventListener("change", onQuery);

  return {
    stop() {
      stopped = true;
      mq.removeEventListener("change", onQuery);
      // Keep the last transform so nothing jumps while the layer fades out.
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerleave", toNeutral);
      cancelAnimationFrame(raf);
      raf = 0;
      attached = false;
      wrap.style.willChange = "";
    },
    dispose() {
      stopped = true;
      mq.removeEventListener("change", onQuery);
      detach();
    },
  };
}
