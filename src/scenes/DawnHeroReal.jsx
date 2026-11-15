import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createQuad } from "../gl/quad";
import { DAWN_REAL_FRAG } from "../gl/dawnReal.frag";
import { clamp01, mix, sectionProgress, smoothstep } from "../lib/scroll";
import { SIGNUP_URL } from "../content/site";

// The same morning as DawnHero, rendered as a real place instead of a drawing.
// World units are kilometres. These three functions must match the shader.
const valleyX = (z) => 0.9 * Math.sin(z * 0.21 + 0.4) + 0.45 * Math.sin(z * 0.53 + 1.3);
const envelope = (z) => Math.pow(smoothstep(-0.3, 25.0, z), 1.25) * (1 - 0.5 * smoothstep(27.5, 44.0, z));
const valleyFloor = (z) => envelope(z) * 1.8 + 0.012;

const PASS_Z = 26.5;
const START = { x: valleyX(0), y: 0.035, z: -5.5 };
const PASS = { x: valleyX(PASS_Z), y: valleyFloor(PASS_Z), z: PASS_Z };

// The sun stands on the bearing of the pass as seen from where the camera starts.
const SUN_AZ = Math.atan2(PASS.x - START.x, PASS.z - START.z);
const PASS_ELEV = Math.atan2(PASS.y - START.y, Math.hypot(PASS.x - START.x, PASS.z - START.z));

function cameraAt(s) {
  const z = START.z + 35.5 * Math.pow(s, 1.15);
  const x = valleyX(Math.max(z, 0));
  const overLand = smoothstep(-1.5, 3.5, z);
  const y = mix(START.y, valleyFloor(z) + 0.24 + 0.004 * Math.max(z, 0), overLand);
  return { x, y, z };
}

// 256 x 256 random values in the red and green channels: the lookup the shader builds
// mountains, waves and cloud from.
function makeNoise() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(S, S);
  let a = 0x9e3779b9;
  const rnd = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < S * S; i++) {
    img.data[i * 4] = Math.floor(rnd() * 256);
    img.data[i * 4 + 1] = Math.floor(rnd() * 256);
    img.data[i * 4 + 2] = Math.floor(rnd() * 256);
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const BEATS = [
  { id: "title", in: [-1, -0.5], out: [0.04, 0.11] },
  { id: "intro", in: [-1, -0.5], out: [0.05, 0.12] },
  { id: "b1", in: [0.16, 0.21], out: [0.3, 0.35] },
  { id: "b2", in: [0.37, 0.42], out: [0.49, 0.54] },
  { id: "b3", in: [0.7, 0.75], out: [0.86, 0.91] },
];

export default function DawnHeroReal() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const beatRefs = useRef({});
  const cueRef = useRef(null);
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
    let frameNo = 0;
    const params = new URLSearchParams(window.location.search);
    const forced = params.has("s") ? clamp01(parseFloat(params.get("s"))) : null;

    const apply = (quad, time, dt) => {
      const target = forced ?? (reduce ? 0 : sectionProgress(section));
      s = dt === 0 ? target : s + (target - s) * (1 - Math.exp(-dt * 6));
      px += (tx - px) * (1 - Math.exp(-dt * 3));
      py += (ty - py) * (1 - Math.exp(-dt * 3));
      intro = dt === 0 ? 1 : Math.min(1, intro + dt / 1.8);
      frameNo += 1;

      const cam = cameraAt(s);
      // Look up the valley: partly along its bends, partly straight at the pass, and at the very
      // end straight into the sun.
      const dz = 2.0;
      const tangent = Math.atan2(valleyX(Math.max(cam.z + dz, 0)) - valleyX(Math.max(cam.z, 0)), dz);
      const toPass = Math.atan2(PASS.x - cam.x, Math.max(PASS.z - cam.z, 2.5));
      let az = mix(toPass, tangent, 0.35 * smoothstep(0.0, 6.0, cam.z));
      // out at sea the frame is turned a little north, so the sun sits right of centre and the
      // words have the left of the sky to themselves
      az -= 0.13 * (1 - smoothstep(0.1, 0.5, s)) * Math.min(1, canvas.clientWidth / canvas.clientHeight / 1.6);
      az = mix(az, SUN_AZ, smoothstep(19.0, 27.0, cam.z));
      az += px * 0.035;
      const sunElev = PASS_ELEV + 0.006 + 0.075 * smoothstep(0.05, 0.9, s);
      const pitch = mix(PASS_ELEV, 0.03, smoothstep(0.1, 0.5, s)) + smoothstep(0.7, 0.95, s) * 0.05 - py * 0.012;
      const dirX = Math.sin(az) * Math.cos(pitch);
      const dirY = Math.sin(pitch);
      const dirZ = Math.cos(az) * Math.cos(pitch);

      quad.set("uCamPos", cam.x, cam.y, cam.z);
      quad.set("uCamTar", cam.x + dirX, cam.y + dirY, cam.z + dirZ);
      // a long lens out at sea, opening up as the valley closes round the camera
      quad.set("uFocal", mix(4.2, 2.5, smoothstep(0.08, 0.5, s)));
      quad.set("uSunDir", Math.sin(SUN_AZ) * Math.cos(sunElev), Math.sin(sunElev), Math.cos(SUN_AZ) * Math.cos(sunElev));
      quad.set("uDay", 0.24 + 0.76 * smoothstep(0.08, 0.8, s));
      quad.set("uSunR", 0.0125 + 0.95 * Math.pow(smoothstep(0.86, 1.0, s), 2.2));
      quad.set("uWash", smoothstep(0.94, 1.0, s));
      quad.set("uIntro", intro * intro * (3 - 2 * intro));
      quad.set("uFrame", frameNo);
      // out at sea the morning is clear and the whole range shows; the cloud gathers as we climb
      quad.set("uCover", mix(0.3, 1.0, smoothstep(0.1, 0.42, s)));
      quad.set("uTitleA", 0);

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

    // Raymarching costs per pixel, so this version draws at about half resolution and lets the
    // browser stretch it. The runner lowers it further if frames run long.
    let quad = createQuad(canvas, DAWN_REAL_FRAG, {
      maxDpr: 1,
      initialScale: 0.5,
      minScale: 0.3,
      maxScale: 0.7,
      onFrame: (time, dt) => apply(quad, time, dt),
    });
    if (!quad.ok) {
      queueMicrotask(() => setMode("fallback"));
      return undefined;
    }
    quad.set("uPageBg", 0.949, 0.973, 1.0);
    const blank = document.createElement("canvas");
    blank.width = blank.height = 2;
    quad.texture("uTitle", blank, 0);
    quad.texture("uNoise", makeNoise(), 1, { tiling: true });
    quad.set("uTitleRect", 0, 0, 1, 1);
    quad.set("uTitleZ", 20);
    quad.resize();

    const onResize = () => {
      quad.resize();
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
      className={`relative bg-night text-white ${pinned ? "h-[560vh]" : ""}`}
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
        {/* a little shade behind the words, none over the picture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(3_11_28/0.30)_0%,transparent_30%,transparent_62%,rgb(3_11_28/0.42)_100%)]"
        />

        <div ref={setBeat("title")} className="absolute inset-x-0 top-[15vh] will-change-transform md:top-[17vh]">
          <div className="shell">
            <h1
              id="page-title"
              tabIndex={-1}
              className="display hero-title text-hero max-w-[9ch] outline-none [text-shadow:0_2px_60px_rgb(3_11_28/0.45)]"
            >
              <span className="rl" style={{ "--i": 0 }}>
                <span>Hope rises</span>
              </span>
              <span className="rl" style={{ "--i": 1 }}>
                <span>in Lebanon</span>
              </span>
            </h1>
          </div>
        </div>

        <div
          ref={setBeat("intro")}
          className="absolute inset-x-0 bottom-0 pb-[max(5.5vh,2.2rem)] will-change-transform"
        >
          <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="text-lead max-w-[30rem] text-white/90 [text-shadow:0_1px_18px_rgb(3_11_28/0.6)]">
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

        <Beat refFn={setBeat("b1")} lines={["First light reaches", "the mountains first."]} />
        <Beat refFn={setBeat("b2")} lines={["Then it reaches", "everyone below."]} />
        <Beat refFn={setBeat("b3")} lines={["We are the ones", "who climb to meet it."]} />

        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[max(2.2vh,0.9rem)] left-1/2 hidden -translate-x-1/2 text-[0.82rem] font-bold tracking-wide text-white/75 md:block"
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

function Beat({ refFn, lines }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[17vh]">
      <div
        ref={refFn}
        style={{ opacity: 0, visibility: "hidden" }}
        className="display text-title absolute left-[7vw] w-max max-w-[86vw] text-white will-change-transform [text-shadow:0_2px_40px_rgb(3_20_60/0.65),0_1px_3px_rgb(3_20_60/0.4)]"
      >
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
