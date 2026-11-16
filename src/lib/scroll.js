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

// back to the top of the page, eased (instantly for anyone who asks for reduced motion)
export function glideToTop() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

// to a section of the page, once it exists (a page loaded on demand may still be arriving)
export function scrollToSection(id, tries = 40) {
  const el = document.getElementById(id);
  if (!el) {
    if (tries > 0) setTimeout(() => scrollToSection(id, tries - 1), 60);
    return;
  }
  if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
  else el.scrollIntoView();
  // and keyboard focus with it, so the next Tab goes on from the section, not from the link that
  // was on the page before (a section is not normally focusable: it is made so, without a ring)
  if (!el.matches("a[href], button, input, select, textarea, [tabindex]")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

// Focus an element once it exists: a page loaded in parts (Platforms picks its phone or desktop
// half after the route has arrived) has no title yet when the route changes.
export function focusWhenThere(id, tries = 40) {
  const el = document.getElementById(id);
  if (el) el.focus({ preventScroll: true });
  else if (tries > 0) setTimeout(() => focusWhenThere(id, tries - 1), 60);
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
