import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createQuad } from "../gl/quad";
import { DAWN_FRAG } from "../gl/dawn.frag";
import { clamp01, mix, sectionProgress, smoothstep } from "../lib/scroll";
import { SIGNUP_URL } from "../content/site";
import cedarUrl from "../assets/images/cedar.png";

const F = 2.2; // must match the shader
const TITLE_Z = 19.8; // between the eighth and ninth ridge
const ZF = 30; // depth of the summit ridge, must match the shader
const YC = 1.55; // top of the cloud sea, must match the shader

// Ridge crests grow as 0.0249 * z^1.64 in the shader, and the valley floor sits at 0.75 of that.
const crestAt = (z) => 0.0249 * Math.pow(z, 1.64);
const SADDLE_H = 0.75 * crestAt(ZF);

// The valley winds as it climbs. Same curve as meander() in the shader.
const meander = (z) => (0.3 * Math.sin(z * 0.5 + 0.7) + 0.16 * Math.sin(z * 1.27 + 2.1)) * smoothstep(0.0, 4.0, z);

// Camera flight: depth eases in, height skims the sea and then follows the valley floor up to
// the pass, a little above it all the way (valley floors sit at 0.64 to 0.79 of the crest).
function cameraAt(s) {
  const z = 34 * Math.pow(s, 1.25);
  const y = 0.14 + 0.8 * crestAt(Math.min(z, ZF + 1)) + 0.16 * smoothstep(1.0, 5.0, z);
  return { z, y };
}

// Text is drawn to a 2D canvas once the fonts are in, then lives inside the scene as a texture,
// so the mountains can stand in front of it.
async function drawTitle() {
  const fontA = '800 condensed 100px "Archivo Variable"';
  try {
    await document.fonts.load(fontA, "Hope rises in Lebanon");
  } catch {
    /* fall through with whatever font is available */
  }
  const W = 2048;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const lines = ["Hope rises", "in Lebanon"];
  const family = '"Archivo Variable", "Lato", sans-serif';
  const measure = (size) => {
    ctx.font = `800 condensed ${size}px ${family}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${-0.022 * size}px`;
    return Math.max(...lines.map((l) => ctx.measureText(l).width));
  };
  const base = 300;
  const size = Math.floor((base * (W - 40)) / measure(base));
  const lh = size * 0.9;
  const H = Math.ceil(lh * lines.length + size * 0.2);
  c.width = W;
  c.height = H;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.font = `800 condensed ${size}px ${family}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${-0.022 * size}px`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  lines.forEach((l, i) => ctx.fillText(l, 16, size * 0.84 + i * lh));
  return { canvas: c, aspect: W / H };
}

// The cedar silhouette from the brand assets becomes a mask the shader can plant on the ridges.
function loadCedar() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const S = 512;
      const tmp = document.createElement("canvas");
      tmp.width = img.naturalWidth;
      tmp.height = img.naturalHeight;
      const tctx = tmp.getContext("2d", { willReadFrequently: true });
      tctx.drawImage(img, 0, 0);
      const { data, width, height } = tctx.getImageData(0, 0, tmp.width, tmp.height);
      let x0 = width, y0 = height, x1 = 0, y1 = 0;
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          if (data[(y * width + x) * 4 + 3] > 24) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      const bw = Math.max(1, x1 - x0);
      const bh = Math.max(1, y1 - y0);
      const scale = (S - 8) / Math.max(bw, bh);
      const c = document.createElement("canvas");
      c.width = c.height = S;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, S, S);
      // white where the tree is: draw the image, then flatten its colour through its own alpha
      const dw = bw * scale;
      const dh = bh * scale;
      const off = document.createElement("canvas");
      off.width = off.height = S;
      const octx = off.getContext("2d");
      octx.drawImage(img, x0, y0, bw, bh, (S - dw) / 2, S - dh - 2, dw, dh);
      octx.globalCompositeOperation = "source-in";
      octx.fillStyle = "#fff";
      octx.fillRect(0, 0, S, S);
      ctx.drawImage(off, 0, 0);
      resolve(c);
    };
    img.onerror = reject;
    img.src = cedarUrl;
  });
}

const BEATS = [
  { id: "intro", in: [-1, -0.5], out: [0.05, 0.12] },
  { id: "b1", in: [0.19, 0.24], out: [0.33, 0.39] },
  { id: "b2", in: [0.52, 0.57], out: [0.67, 0.73] },
  { id: "b3", in: [0.75, 0.8], out: [0.87, 0.92] },
];

export default function DawnHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const beatRefs = useRef({});
  const cueRef = useRef(null);
  // gl: the scroll-driven flight. still: one frame, for people who asked for less motion.
  // fallback: no WebGL2, so a plain gradient and a real heading.
  const [mode, setMode] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "still" : "gl",
  );

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let s = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let intro = 0;
    let titleReady = 0;
    let titleAspect = 2.6;
    let dims = { cssWidth: 1, cssHeight: 1 };
    const params = new URLSearchParams(window.location.search);
    const forced = params.has("s") ? clamp01(parseFloat(params.get("s"))) : null;

    const apply = (quad, time, dt) => {
      const target = forced ?? (reduce ? 0 : sectionProgress(section));
      s = dt === 0 ? target : s + (target - s) * (1 - Math.exp(-dt * 7));
      px += (tx - px) * (1 - Math.exp(-dt * 3.5));
      py += (ty - py) * (1 - Math.exp(-dt * 3.5));
      intro = dt === 0 ? 1 : Math.min(1, intro + dt / 1.6);
      if (titleReady > 0 && titleReady < 1) titleReady = dt === 0 ? 1 : Math.min(1, titleReady + dt / 2.2);

      const aspect = dims.cssWidth / dims.cssHeight;
      const cam = cameraAt(s);
      const sunX = (aspect / F) * (aspect > 1 ? 0.46 : 0.3);
      // fly along the sun's bearing, so the pass and the sun stay lined up the whole way
      const camX = sunX * cam.z + meander(cam.z) + px * 0.22;
      const camY = cam.y - py * 0.02;
      // sunrise is timed to the moment the camera comes out above the cloud
      const day = 0.17 + 0.33 * smoothstep(0.05, 0.46, s) + 0.5 * smoothstep(0.5, 0.9, s);
      const hy = mix(-0.3, -0.22, smoothstep(0.12, 0.7, s));
      // The sun stays in the pass at the head of the valley and climbs slowly out of it.
      const ahead = Math.max(ZF - cam.z, 3.2);
      const passX = (sunX * ZF + meander(ZF) - camX) / ahead;
      const passY = (SADDLE_H - Math.min(camY, SADDLE_H + 0.2)) / ahead;
      const sunKx = mix(sunX, passX, smoothstep(0.0, 0.3, s));
      const sunKy = passY + 0.014 + 0.1 * smoothstep(0.0, 0.8, s);
      // at the very end the disc opens until it is the whole sky: the same move as the page transition
      const sunR = 0.074 + 1.7 * Math.pow(smoothstep(0.84, 1.0, s), 2.2);

      quad.set("uDay", day);
      quad.set("uCam", camX, camY, cam.z);
      quad.set("uHy", hy);
      quad.set("uSun", sunKx, sunKy);
      quad.set("uSunR", sunR);
      quad.set("uBearing", sunX);
      quad.set("uDeck", smoothstep(YC - 0.05, YC + 0.4, camY));
      quad.set(
        "uFog",
        smoothstep(YC - 0.36, YC - 0.02, camY) * (1 - smoothstep(YC + 0.02, YC + 0.32, camY)) * 0.96,
      );
      quad.set("uWash", smoothstep(0.93, 1.0, s));
      quad.set("uIntro", intro * intro * (3 - 2 * intro));

      // Title: sized from the opening frame, then left to the perspective. On load it rises
      // from behind the ridge, which is the whole idea of the page in one move.
      const halfW = (aspect / F) * TITLE_Z;
      const wide = aspect > 1;
      let width = (wide ? 0.46 : 0.9) * 2 * halfW;
      let height = width / titleAspect;
      const maxH = (wide ? 0.3 : 0.2) * TITLE_Z;
      if (height > maxH) {
        height = maxH;
        width = height * titleAspect;
      }
      // the left edge stays pinned to the margin while the camera closes in
      const halfNow = (aspect / F) * Math.max(TITLE_Z - cam.z, 1);
      const x0 = camX + (wide ? -halfNow + 0.065 * 2 * halfNow : -width / 2);
      const e = 1 - Math.pow(1 - titleReady, 4);
      const y0 = 0.14 + (wide ? 0.15 : 0.22) * TITLE_Z - (1 - e) * height * 1.05;
      quad.set("uTitleRect", x0, y0, x0 + width, y0 + height);
      quad.set("uTitleZ", TITLE_Z);
      quad.set("uTitleA", (titleReady > 0 ? 1 : 0) * (1 - smoothstep(0.1, 0.19, s)));

      // DOM beats
      for (const b of BEATS) {
        const el = beatRefs.current[b.id];
        if (!el) continue;
        const o = smoothstep(b.in[0], b.in[1], s) * (1 - smoothstep(b.out[0], b.out[1], s));
        const lift = (1 - smoothstep(b.in[0], b.in[1], s)) * 28 - smoothstep(b.out[0], b.out[1], s) * 28;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${lift.toFixed(1)}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
      if (cueRef.current) cueRef.current.style.opacity = (1 - smoothstep(0.01, 0.05, s)).toFixed(3);
    };

    let quad = createQuad(canvas, DAWN_FRAG, {
      maxDpr: 1.5,
      onFrame: (time, dt) => apply(quad, time, dt),
    });
    if (!quad.ok) {
      queueMicrotask(() => setMode("fallback"));
      return undefined;
    }
    quad.set("uPageBg", 0.949, 0.973, 1.0);
    quad.set("uTitleA", 0);
    // 1x1 placeholders so the samplers are valid before the fonts arrive
    const blank = document.createElement("canvas");
    blank.width = blank.height = 2;
    quad.texture("uTitle", blank, 0);
    quad.texture("uCedar", blank, 1);
    dims = quad.resize();

    let alive = true;
    drawTitle().then((t) => {
      if (!alive) return;
      quad.texture("uTitle", t.canvas, 0);
      titleAspect = t.aspect;
      titleReady = reduce ? 1 : 0.001;
      if (reduce) quad.renderOnce();
    });
    loadCedar()
      .then((c) => {
        if (!alive) return;
        quad.texture("uCedar", c, 1);
        if (reduce) quad.renderOnce();
      })
      .catch(() => {});

    const onResize = () => {
      dims = quad.resize();
      if (reduce) quad.renderOnce();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const onPointer = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    let io;
    if (reduce) {
      quad.renderOnce();
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      // only burn frames while the hero is on screen and the tab is visible
      io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? quad.start() : quad.stop()), {
        rootMargin: "80px",
      });
      io.observe(section);
    }
    const onVis = () => {
      if (reduce) return;
      if (document.hidden) quad.stop();
      else if (section.getBoundingClientRect().bottom > 0) quad.start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      quad.destroy();
    };
  }, []);

  const pinned = mode === "gl";
  const setBeat = (id) => (el) => {
    beatRefs.current[id] = el;
  };

  return (
    <section
      ref={sectionRef}
      className={`relative bg-night text-white ${pinned ? "h-[520vh]" : ""}`}
      aria-label="Hope rises in Lebanon"
    >
      <div className={`${pinned ? "sticky top-0" : "relative"} h-svh min-h-[34rem] overflow-clip`}>
        {mode === "fallback" ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,#030b1c_0%,#06224f_38%,#0a5cc4_62%,#ffc27a_78%,#06142e_78.2%,#030b1c_100%)]"
          />
        ) : (
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        )}

        <h1
          id="page-title"
          tabIndex={-1}
          className={
            mode === "fallback"
              ? "display text-hero absolute left-[7vw] top-[18vh] outline-none"
              : "sr-only"
          }
        >
          Hope rises in Lebanon
        </h1>

        {/* Opening beat: who we are, and the two ways in */}
        <div
          ref={setBeat("intro")}
          className="absolute inset-x-0 bottom-0 pb-[max(5.5vh,2.2rem)] will-change-transform"
        >
          <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="text-lead max-w-[30rem] text-white/85">
              AIESEC in Lebanon is youth leading youth. We send young people from Lebanon out into the world, and
              welcome the world into Lebanon.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={SIGNUP_URL}
                className="inline-flex h-13 items-center rounded-full bg-sun px-7 text-[1.02rem] font-bold text-ink transition-[background-color,scale] duration-300 hover:bg-white active:scale-[0.98]"
              >
                Join from Lebanon
              </a>
              <Link
                to="/lebanon"
                viewTransition
                className="inline-flex h-13 items-center rounded-full border border-white/45 bg-white/8 px-7 text-[1.02rem] font-bold text-white backdrop-blur-sm transition-[background-color,border-color,scale] duration-300 hover:border-white hover:bg-white/18 active:scale-[0.98]"
              >
                Come to Lebanon
              </Link>
            </div>
          </div>
        </div>

        <Beat refFn={setBeat("b1")} align="left">
          <span className="rl">
            <span>First light reaches</span>
          </span>
          <span className="rl">
            <span>the mountains first.</span>
          </span>
        </Beat>
        <Beat refFn={setBeat("b2")} align="left">
          <span className="rl">
            <span>Then it reaches</span>
          </span>
          <span className="rl">
            <span>everyone below.</span>
          </span>
        </Beat>
        <Beat refFn={setBeat("b3")} align="left">
          <span className="rl">
            <span>We are the ones</span>
          </span>
          <span className="rl">
            <span>who climb to meet it.</span>
          </span>
        </Beat>

        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[max(2.2vh,0.9rem)] left-1/2 hidden -translate-x-1/2 text-[0.82rem] font-bold tracking-wide text-white/70 md:block"
        >
          Scroll to climb
        </div>
      </div>

      {mode !== "gl" && (
        <div className="bg-night-800 py-20">
          <div className="shell display text-title space-y-6 text-white">
            <p>First light reaches the mountains first.</p>
            <p>Then it reaches everyone below.</p>
            <p className="text-sun">We are the ones who climb to meet it.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function Beat({ refFn, align, children }) {
  const pos =
    align === "left"
      ? "left-[7vw] text-left"
      : align === "right"
        ? "right-[7vw] text-right"
        : "left-1/2 -translate-x-1/2 text-center";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[17vh]" aria-hidden="false">
      <div
        ref={refFn}
        style={{ opacity: 0, visibility: "hidden" }}
        className={`display text-title absolute w-max max-w-[86vw] text-white will-change-transform [text-shadow:0_2px_30px_rgb(3_40_110/0.45),0_1px_3px_rgb(3_40_110/0.25)] ${pos}`}
      >
        {children}
      </div>
    </div>
  );
}
