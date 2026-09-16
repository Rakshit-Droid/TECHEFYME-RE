/**
 * Hero film config. The hero is a timeline scrubbed by scroll: the visitor drives the
 * hands together and the black hole open; out of that black the mark draws itself and
 * the wordmark arrives; then the lockup travels up into the header logo and becomes
 * it; then the headline.
 *
 * The first two beats are video clips from scripts/encode-hero.sh, keyframed densely
 * for scrubbing and played back to back. The third is the page moving a still of the
 * last frame, because no film can know where the header logo sits.
 */
export const CLIPS = {
  desktop: { hands: "/hero/hands.0165079f.d.mp4", logo: "/hero/logo.9c56f234.d.mp4" },
  mobile: { hands: "/hero/hands.3968266d.m.mp4", logo: "/hero/logo.d1013a90.m.mp4" },
} as const;

/** Clip lengths, in seconds. The logo clip is 16:9 and drawn whole, not cropped. */
export const HANDS_SECONDS = 7.25;
export const LOGO_SECONDS = 3.75;

/** Frame 0, used as the poster so the first paint is the film's first frame. */
export const POSTER = "/hero/poster.b65ac76e.webp";

/**
 * The lockup still, cut from the logo film's last frame. Coordinates are in the film's
 * own 2560x1440 pixels: `crop` is where the still sits in the frame, `mark` the disc
 * and its escaping dot.
 */
export const LOCKUP = {
  src: "/hero/lockup.ded7c741.webp",
  film: { width: 2560, height: 1440 },
  crop: { x: 329, y: 524, width: 1903, height: 388 },
  mark: { centerX: 547, centerY: 717.5, height: 323 },
} as const;

/**
 * Where the nav's LogoMark draws the same shapes inside its 100-unit viewBox: disc and
 * dot span x 18-90 and y 20-80. The flight lands on these, mark to mark, because the
 * solid disc is what the eye follows; the wordmarks differ in case and only crossfade.
 */
export const NAV_MARK = { centerX: 0.54, centerY: 0.5, height: 0.6 } as const;

/** Seconds of scroll-time the lockup takes to reach the header, and to hold the headline after. */
export const MERGE_SECONDS = 2.0;
const TAIL_SECONDS = 2.3;

/** Where the films end and the flight begins, and the whole scrubbed timeline. */
export const FILM_SECONDS = HANDS_SECONDS + LOGO_SECONDS;
export const TIMELINE_SECONDS = FILM_SECONDS + MERGE_SECONDS + TAIL_SECONDS;

/** Cues, in seconds along the timeline. */
export const CUES = {
  /** The hole is expanding: nav items start checking the frame behind them. */
  probeFrom: 3.98,
  /** Frame dark enough for white nav text. */
  navDark: 6.8,
  /** The hands film ends here and the logo film begins, on black. */
  logo: HANDS_SECONDS,
  /** The header logo steps aside for the one being drawn. */
  navLogoOut: 7.6,
} as const;

/** Scroll progress, 0 to 1, at which a time on the timeline falls. */
export const progressAt = (seconds: number) => seconds / TIMELINE_SECONDS;

/** Cursor parallax only on desktop with a fine pointer and motion allowed. */
export const FILM = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export const MOBILE = "(max-width: 767px)";


/**
 * Runs in <head> before first paint: marks JS as available so the hero can hide
 * its headline until the film reaches black, and falls back to showing everything
 * if the hero controller has not mounted 1s after load (blocked chunk, hydration error).
 */
export const HEAD_SCRIPT = `(function(d,w){var h=d.documentElement;h.setAttribute('data-js','');w.addEventListener('load',function(){setTimeout(function(){if(!h.hasAttribute('data-hero-armed'))h.setAttribute('data-hero-static','')},1000)})})(document,window)`;
