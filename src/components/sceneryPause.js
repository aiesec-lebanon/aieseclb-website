import { useSyncExternalStore } from "react";

// One switch for every moving set and all the weather on a page (the button is in World.jsx).
// Remembered for the visitor.
const KEY = "aiesec-scenery";
const subs = new Set();
let paused = (() => {
  try {
    return localStorage.getItem(KEY) === "paused";
  } catch {
    return false;
  }
})();
const apply = () => document.documentElement.classList.toggle("scenery-paused", paused);
if (typeof document !== "undefined") apply();

export function setSceneryPaused(v) {
  paused = v;
  try {
    localStorage.setItem(KEY, v ? "paused" : "playing");
  } catch {
    /* nothing to remember it in */
  }
  apply();
  subs.forEach((f) => f());
}

export function useSceneryPaused() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => paused,
  );
}
