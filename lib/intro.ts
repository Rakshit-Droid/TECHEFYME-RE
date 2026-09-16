/**
 * Intro film config. A black curtain over the first page of a session: the mark
 * draws itself, the wordmark arrives, the curtain dissolves into the white hero.
 *
 * The film is an asset, not code. Renditions come from scripts/encode-intro.sh;
 * the wordmark in the source read "TechfyMe" and was replaced frame by frame by
 * scripts/intro-wordmark.py before encoding.
 */
export const INTRO = {
  av1: "/intro/intro.dfa0531d.av1.mp4",
  h264: "/intro/intro.1f3dfca3.h264.mp4",
  /** Film length. The curtain starts dissolving as the last frames hold. */
  duration: 4.0,
  /** How long the page waits for a first frame before giving up on the intro. */
  readyMs: 700,
  /** Nothing holds the page past this, whatever the network or the decoder do. */
  capMs: 6000,
} as const;

const INTRO_KEY = "tm-intro";

/**
 * Runs in <head> before first paint, so the curtain is in the first painted frame
 * rather than dropping over a page that has already appeared. Every reason to skip
 * is decided here, and the session is marked immediately so a reload mid-film does
 * not replay it. No JS, no storage, or a thrown exception all mean: no curtain.
 */
export const INTRO_HEAD_SCRIPT = `(function(d,w){try{
var s=w.sessionStorage,k='${INTRO_KEY}';
if(s.getItem(k))return;s.setItem(k,'1');
if(w.location.pathname!=='/')return;
if(d.visibilityState!=='visible')return;
if(w.scrollY>0)return;
var c=w.navigator.connection;
if(c&&(c.saveData||/^(slow-)?2g$/.test(c.effectiveType||'')))return;
d.documentElement.setAttribute('data-intro','');
}catch(e){}})(document,window)`;
