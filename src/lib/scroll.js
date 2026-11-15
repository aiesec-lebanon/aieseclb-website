import Lenis from "lenis";

// One smooth-scroll instance for the whole app. Wheel input is eased so scrubbed scenes do not
// step; touch devices and reduced-motion users keep native scrolling.
let lenis = null;

export function startSmoothScroll() {
  if (lenis || typeof window === "undefined") return lenis;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (reduce || coarse) return null;
  lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 0.95, smoothWheel: true, autoRaf: true, anchors: true });
  return lenis;
}

export function stopSmoothScroll() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export const clamp01 = (n) => Math.min(1, Math.max(0, n));
export const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const mix = (a, b, t) => a + (b - a) * t;

// Progress of a tall section with a sticky child: 0 when its top meets the top of the viewport,
// 1 when its bottom meets the bottom.
export function sectionProgress(el) {
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  if (span <= 0) return 0;
  return clamp01(-r.top / span);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
