// The drawn hero's shader, compiled ahead of time in the canvas the drawn hero will then draw in.
// The realistic hero starts this when the device is struggling (it may be about to fall back); if
// the switch comes, the drawn hero takes the canvas and its compile, finished or still under way,
// instead of starting a compile of its own from nothing.
import { prelink } from "./quad";

let warm = null;

export function warmUp(frag) {
  if (warm) return;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2;
  warm = { canvas, programs: prelink(canvas, frag, { limit: 60000 }) };
  warm.programs.catch(() => {
    warm = null;
  });
}

export function takeWarm() {
  const w = warm;
  warm = null;
  return w;
}
