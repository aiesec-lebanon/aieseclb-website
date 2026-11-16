import { useEffect, useRef } from "react";
import { gen, genDepth } from "../lib/media";
import { useSceneryPaused } from "./sceneryPause";
import { BACKDROP_CROP as CROP } from "./worldType";

// AN EVENT'S PHOTOGRAPH, CONTINUED INTO ITS WORLD, IN 3D
//
// The framed photograph on an event's scene shows the middle of the picture (BACKDROP_CROP). Behind it,
// across the whole screen, the same picture carries on from the edges of the frame, lined up
// with it, so the frame reads as a window onto the event rather than a picture on a wall. Past the
// edges of the photograph it dissolves into the world's colour.
//
// The continuation is in 3D: each photograph has a depth map (src/assets/depth/, made with Depth
// Anything V2 by cook/tools/depth.mjs). As the scene scrolls past, the camera moves and comes
// closer, near things shift more than far ones, and the picture opens up like a place you are
// walking into. On the side of the text the picture gives way to the world's colour, so the words
// stay on a calm ground. Still for anyone who asks for reduced motion; it keeps lining up with the
// frame as the page scrolls either way.

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uImg;
uniform sampler2D uDepth;
uniform vec2 uRes;      // canvas size, css px
uniform vec4 uRect;     // the picture as the frame shows it: centre and size, css px, y down
uniform vec2 uCam;      // camera shift, in picture widths
uniform float uZoom;    // camera coming closer
uniform vec3 uBg;       // the world's colour
uniform vec2 uGrade;    // how much of the picture shows through, and its brightness
uniform vec4 uScrim;    // mode (0 text left, 1 text right, 2 text above), edge a, edge b, strength
uniform float uHasDepth;
in vec2 vUv;
out vec4 o;

float depthAt(vec2 uv) { return uHasDepth > 0.5 ? textureLod(uDepth, clamp(uv, 0.0, 1.0), 1.0).r : 0.5; }

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec2 uvS = 0.5 + (p - uRect.xy) / (uRect.zw * uZoom);
  // the point of the picture that the camera, moved by uCam, sees here: near things (white in the
  // depth map) move more than far ones; the subject in the middle of the frame stays put
  float focus = uHasDepth > 0.5 ? textureLod(uDepth, vec2(0.5), 5.0).r : 0.5;
  vec2 uv = uvS;
  for (int i = 0; i < 5; i++) uv = uvS - (depthAt(uv) - focus) * uCam;
  // past the edge of the photograph it carries on as its own reflection, quickly softer, fading
  // out (stretching the edge pixels would draw streaks)
  vec2 out2 = max(abs(uv - 0.5) - 0.5, 0.0);
  float away = length(out2 * vec2(uRect.z / uRect.w, 1.0));
  vec2 mirrored = 1.0 - abs(mod(uv, 2.0) - 1.0);
  float lod = 0.8 + min(away * 30.0, 5.5);
  vec3 c = textureLod(uImg, mirrored, lod).rgb;
  float keep = uGrade.x * (1.0 - smoothstep(0.04, 0.32, away));
  // the side of the text gives way to the world
  float s;
  if (uScrim.x < 0.5) s = 1.0 - smoothstep(uScrim.y, uScrim.z, p.x);
  else if (uScrim.x < 1.5) s = smoothstep(uScrim.y, uScrim.z, p.x);
  else s = 1.0 - smoothstep(uScrim.y, uScrim.z, p.y);
  keep *= 1.0 - s * uScrim.w;
  vec3 col = mix(uBg, c * uGrade.y, keep);
  o = vec4(col, 1.0);
}`;

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function loadTexture(gl, url, unit) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    img
      .decode()
      .then(() => {
        const tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        resolve({ tex, w: img.naturalWidth, h: img.naturalHeight });
      })
      .catch(() => resolve(null));
  });
}

export default function Backdrop({ photo, world, textSide = "left" }) {
  const holder = useRef(null);
  const paused = useSceneryPaused();
  useEffect(() => {
    const box = holder.current;
    const section = box && box.closest("section");
    const frame = section && section.querySelector("[data-backdrop-frame]");
    if (!box || !frame) return undefined;
    // a new canvas each time: its context is let go of when the scene leaves the screen
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 h-full w-full";
    box.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.remove();
      return undefined;
    }
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.remove();
      return undefined;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), rect: u("uRect"), cam: u("uCam"), zoom: u("uZoom"), bg: u("uBg"),
      grade: u("uGrade"), scrim: u("uScrim"), hasDepth: u("uHasDepth"),
    };
    gl.uniform1i(u("uImg"), 0);
    gl.uniform1i(u("uDepth"), 1);
    gl.uniform3fv(U.bg, hexRgb(world.bg));
    // dark worlds keep the picture dimmer, light worlds let more of it through
    gl.uniform2f(U.grade, world.scheme === "dark" ? 0.9 : 0.8, world.scheme === "dark" ? 0.84 : 1.0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let still = reduce || paused;
    let img = null;
    let hasDepth = false;
    let raf = 0;
    let alive = true;
    let pointerX = 0;
    let pointerY = 0;
    const SCALE = 0.75; // the backdrop is soft: three quarters of the pixels is plenty

    const draw = (now) => {
      raf = 0;
      if (!alive || !img) return;
      const cr = canvas.getBoundingClientRect();
      const W = Math.max(1, Math.round(cr.width * SCALE));
      const H = Math.max(1, Math.round(cr.height * SCALE));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      gl.viewport(0, 0, W, H);
      const fr = frame.getBoundingClientRect();
      // where the frame's picture sits, in the canvas: cover-fitted to the frame, then CROP larger
      const A = img.w / img.h;
      const F = fr.width / Math.max(fr.height, 1);
      const coverW = A > F ? fr.height * A : fr.width;
      const coverH = A > F ? fr.height : fr.width / A;
      gl.uniform2f(U.res, cr.width, cr.height);
      gl.uniform4f(U.rect, fr.left - cr.left + fr.width / 2, fr.top - cr.top + fr.height / 2, coverW * CROP, coverH * CROP);
      // the camera: how far through its scene the visitor is, and a slow drift
      const sr = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(1, Math.max(0, (vh - sr.top) / (vh + sr.height)));
      const t = now / 1000;
      const k = still ? 0 : 1;
      const camX = k * (Math.sin(t * 0.21) * 0.014 + pointerX * 0.02);
      const camY = (prog - 0.5) * (reduce ? 0 : 0.14) + k * (Math.sin(t * 0.17 + 1.3) * 0.008 + pointerY * 0.012);
      gl.uniform2f(U.cam, camX, camY);
      gl.uniform1f(U.zoom, 1 + (reduce ? 0 : (prog - 0.5) * 0.14));
      // the ground the text stands on
      const narrow = cr.width < 768;
      if (narrow) gl.uniform4f(U.scrim, 2, fr.top - cr.top - vh * 0.32, fr.top - cr.top - vh * 0.02, 0.92);
      else if (textSide === "left") gl.uniform4f(U.scrim, 0, cr.width * 0.36, cr.width * 0.5, 0.9);
      else gl.uniform4f(U.scrim, 1, cr.width * 0.5, cr.width * 0.64, 0.9);
      gl.uniform1f(U.hasDepth, hasDepth ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onPointer = (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    Promise.all([loadTexture(gl, gen(photo), 0), loadTexture(gl, genDepth(photo), 1)]).then(([a, d]) => {
      if (!alive || !a) return;
      img = a;
      hasDepth = Boolean(d);
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 0.9s";
      kick();
      requestAnimationFrame(() => (canvas.style.opacity = "1"));
    });
    // when still, it is drawn again only when the page moves
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("pointermove", onPointer);
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      canvas.remove();
    };
  }, [photo, world, textSide, paused]);
  return <div ref={holder} aria-hidden="true" className="absolute inset-0" />;
}
