import { track as vercelTrack } from "@vercel/analytics";

type Events = {
  cta_book: { location: "nav" | "hero" | "services" | "process" | "contact" | "pricing" | "menu" };
  cta_see_services: Record<string, never>;
  form_start: Record<string, never>;
  hero_complete: Record<string, never>;
  hero_left_early: Record<string, never>;
  hero_fallback: { reason: "reducedMotion" | "saveData" | "autoplay" | "codec" | "error" | "timeout" };
  intro_play: Record<string, never>;
  intro_end: { at: number; skipped: "click" | "key" | "scroll" | "button" | "hidden" | "error" | "timeout" | "none" };
  faq_open: { id: string };
  whatsapp_click: Record<string, never>;
};

export function track<K extends keyof Events>(name: K, props?: Events[K]) {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics must never break the page.
  }
}
