/**
 * Keeps nav text legible while the black hole expands underneath it.
 *
 * The hole reaches the top-centre before the corners, so no single cue works for
 * every nav element at every viewport. While the frame is darkening we sample the
 * current frame into a tiny canvas and give each [data-nav-probe] element the
 * polarity of the pixels directly under it.
 */
const W = 96;
const H = 64;
const DARK_BELOW = 0.45;
const LIGHT_ABOVE = 0.55;
const EVERY_NTH_CALL = 3;

type FrameSource = () => HTMLImageElement | undefined;

export function createNavProbe(getFrame: FrameSource) {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const targets = header ? Array.from(header.querySelectorAll<HTMLElement>("[data-nav-probe]")) : [];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let calls = 0;
  let broken = !ctx || targets.length === 0;
  let active = false;

  const clear = () => {
    if (!active) return;
    active = false;
    for (const el of targets) delete el.dataset.theme;
  };

  const sample = () => {
    if (broken || !ctx || !header) return;
    // Once the nav has its own solid background, the film is no longer behind the text.
    if (header.hasAttribute("data-scrolled")) return clear();
    if (calls++ % EVERY_NTH_CALL) return;

    const frame = getFrame();
    if (!frame?.naturalWidth) return;

    let data: Uint8ClampedArray;
    try {
      ctx.drawImage(frame, 0, 0, W, H);
      data = ctx.getImageData(0, 0, W, H).data;
    } catch {
      broken = true;
      return clear();
    }

    // The frame is drawn cover with object-position 46% 55% inside the hero viewport.
    const box = (document.querySelector(".hero-sticky") as HTMLElement | null)?.getBoundingClientRect();
    if (!box) return;
    const scale = Math.max(box.width / frame.naturalWidth, box.height / frame.naturalHeight);
    const rw = frame.naturalWidth * scale;
    const rh = frame.naturalHeight * scale;
    const ox = box.left + (box.width - rw) * 0.46;
    const oy = box.top + (box.height - rh) * 0.55;

    active = true;
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const x0 = Math.max(0, Math.floor(((r.left - ox) / rw) * W));
      const x1 = Math.min(W, Math.ceil(((r.right - ox) / rw) * W));
      const y0 = Math.max(0, Math.floor(((r.top - oy) / rh) * H));
      const y1 = Math.min(H, Math.ceil(((r.bottom - oy) / rh) * H));
      let sum = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          sum += 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!;
          n++;
        }
      }
      if (!n) continue;
      const luma = sum / n / 255;
      const current = el.dataset.theme ?? "light";
      const next = luma < DARK_BELOW ? "dark" : luma > LIGHT_ABOVE ? "light" : current;
      if (el.dataset.theme !== next) el.dataset.theme = next;
    }
  };

  return { sample, clear };
}
