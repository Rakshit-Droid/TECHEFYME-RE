import { WebGLRenderer } from "three";

/**
 * One renderer per visual layer, tuned for a decorative backdrop: no depth or stencil
 * buffers, no antialiasing (the effects are soft and rendered below full size), and
 * the low-power GPU where the device has a choice.
 */
export function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    // Internal size is set by the layer from its own render scale, never from the screen's DPR.
    renderer.setPixelRatio(1);
    renderer.autoClear = false;
    return renderer;
  } catch {
    return null;
  }
}

/** Releases the GPU side of a renderer and frees its context slot for the browser. */
export function disposeRenderer(renderer: WebGLRenderer) {
  renderer.dispose();
  renderer.forceContextLoss();
}
