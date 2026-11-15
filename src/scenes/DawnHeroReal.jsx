import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createQuad } from "../gl/quad";
import { Governor, TIERS, detectDevice, readStored, tierIndex, writeStored } from "../gl/quality";
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
  { id: "b2", in: [0.53, 0.58], out: [0.66, 0.71] },
  { id: "b3", in: [0.75, 0.8], out: [0.87, 0.91] },
];

// onTooSlow(reason) is called when this device cannot run the realistic scene; the page then
// shows the drawn hero instead. Add ?hud to the address to see what quality was chosen,
// ?tier=minimal|low|medium|high|ultra to pin one, or ?start=<tier> to choose where it starts.
export default function DawnHeroReal({ onTooSlow }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const beatRefs = useRef({});
  const cueRef = useRef(null);
  const hudRef = useRef(null);
  const tooSlowRef = useRef(onTooSlow);
  const [mode, setMode] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "still" : "gl",
  );
  const [hudOn] = useState(() => new URLSearchParams(window.location.search).has("hud"));

  useEffect(() => {
    tooSlowRef.current = onTooSlow;
  }, [onTooSlow]);

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

    // the camera of the last frame: while it holds still, frames are blended into a sharp image
    const prevCam = new Float32Array(10);
    const apply = (quad, time, dt) => {
      const target = forced ?? (reduce ? 0 : sectionProgress(section));
      s = dt === 0 ? target : s + (target - s) * (1 - Math.exp(-dt * 6));
      if (Math.abs(target - s) < 2e-5) s = target;
      px += (tx - px) * (1 - Math.exp(-dt * 3));
      py += (ty - py) * (1 - Math.exp(-dt * 3));
      if (Math.abs(tx - px) < 1e-4) px = tx;
      if (Math.abs(ty - py) < 1e-4) py = ty;
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

      const focal = mix(4.2, 2.5, smoothstep(0.08, 0.5, s));
      const now = [cam.x, cam.y, cam.z, dirX, dirY, dirZ, focal, s, intro, 0];
      let moved = false;
      for (let i = 0; i < now.length; i++) {
        if (Math.abs(now[i] - prevCam[i]) > 1e-6) moved = true;
        prevCam[i] = now[i];
      }
      if (moved && quad.resetHistory) quad.resetHistory();

      quad.set("uCamPos", cam.x, cam.y, cam.z);
      quad.set("uCamTar", cam.x + dirX, cam.y + dirY, cam.z + dirZ);
      // a long lens out at sea, opening up as the valley closes round the camera
      quad.set("uFocal", focal);
      quad.set("uSunDir", Math.sin(SUN_AZ) * Math.cos(sunElev), Math.sin(sunElev), Math.cos(SUN_AZ) * Math.cos(sunElev));
      quad.set("uDay", 0.24 + 0.76 * smoothstep(0.08, 0.8, s));
      quad.set("uSunR", 0.0125 + 0.95 * Math.pow(smoothstep(0.86, 1.0, s), 2.2));
      quad.set("uWash", smoothstep(0.94, 1.0, s));
      quad.set("uIntro", intro * intro * (3 - 2 * intro));
      quad.set("uFrame", frameNo);
      // out at sea the morning is clear and the whole range shows; the cloud gathers as we climb
      quad.set("uCover", smoothstep(0.08, 0.42, s));
      // inland, in the shadow of the range and under the cloud, the camera opens up
      quad.set("uExposure", 1 + 0.9 * smoothstep(0.12, 0.28, s) * (1 - smoothstep(0.46, 0.58, s)));
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

    // While nothing moves, weaker devices draw every other frame: the sea and the cloud drift
    // slowly enough that nobody sees it, and the battery does.
    let lastActive = performance.now();
    let lastTarget = -1;
    let skipFlip = false;
    let throttled = false;
    let idleThrottle = false;
    let governor = null;
    let device = null;
    let quad = null;

    const hud = hudRef.current;
    let hudAt = 0;
    const updateHud = () => {
      const now = performance.now();
      if (!governor || now - hudAt < 500) return;
      hudAt = now;
      const st = governor.stats;
      const size = quad.getSize();
      const info = {
        tier: TIERS[governor.tier].name,
        scale: Number(governor.scale.toFixed(2)),
        width: size.width,
        height: size.height,
        fps: Math.round(st.fps),
        gpuMs: st.gpu == null ? null : Number(st.gpu.toFixed(1)),
        cap: governor.capMs ? Math.round(1000 / governor.capMs) : null,
        timer: quad.hasTimer,
        idle: throttled,
        renderer: device ? device.renderer : "",
      };
      window.__heroQuality = info;
      if (hud) {
        hud.textContent =
          `${info.tier} · ${info.width}×${info.height} (${Math.round(info.scale * 100)}%) · ${info.fps} fps` +
          (info.gpuMs != null ? ` · gpu ${info.gpuMs} ms` : "") +
          (info.cap ? ` · capped at ${info.cap} fps` : "") +
          (info.idle ? " · idle" : "");
      }
    };

    // Raymarching costs per pixel, so this scene draws below screen resolution and lets the
    // browser stretch it. How far below, and how much detail, the governor decides.
    quad = createQuad(canvas, DAWN_REAL_FRAG, {
      maxDpr: 1,
      initialScale: 0.5,
      adaptive: false,
      timer: !params.has("notimer"),
      accumulate: !params.has("noaccum"),
      shouldDraw: (now) => {
        const t = sectionProgress(section);
        if (Math.abs(t - lastTarget) > 1e-4) {
          lastTarget = t;
          lastActive = now;
        }
        throttled = idleThrottle && now - lastActive > 2000 && governor !== null && governor.settled();
        if (!throttled) return true;
        skipFlip = !skipFlip;
        return skipFlip;
      },
      onFrame: (time, dt, info) => {
        apply(quad, time, dt);
        if (governor) {
          if (throttled) governor.pause(400);
          else governor.frame(info.rawDtMs, info.gpuMs);
        }
        updateHud();
      },
    });
    if (!quad.ok) {
      queueMicrotask(() => setMode("fallback"));
      return undefined;
    }

    // Pick a starting quality for this device, then let the governor refine it.
    device = detectDevice(quad.gl);
    const forcedTier = tierIndex(params.get("tier") || "");
    const startTier = tierIndex(params.get("start") || "");
    const heroForced = params.get("hero") === "real";
    const stored = readStored();
    const remembered = stored && !stored.fallback && stored.renderer === device.renderer ? stored : null;
    if (device.software && forcedTier < 0 && !heroForced) {
      // drawn by the CPU: this scene would crawl, the drawn one will not
      writeStored({ renderer: device.renderer, fallback: true });
      quad.destroy();
      queueMicrotask(() => tooSlowRef.current && tooSlowRef.current("software"));
      return undefined;
    }
    // phones are capped at medium: they would manage more for a minute, then heat up
    const maxTier = forcedTier >= 0 ? forcedTier : device.mobile ? 2 : TIERS.length - 1;
    let tier = forcedTier >= 0 ? forcedTier : startTier >= 0 ? startTier : remembered ? remembered.tier : Math.max(0, device.tier);
    tier = Math.min(tier, maxTier);

    const applyQuality = ({ tier: ti, scale }) => {
      const t = TIERS[ti];
      quad.seti("uSteps", t.steps);
      quad.seti("uOct", t.oct);
      quad.seti("uNOct", t.nOct);
      quad.seti("uExact", t.exact);
      quad.set("uGrow", t.grow);
      quad.seti("uShadowN", t.shadow);
      quad.seti("uReflN", t.refl);
      quad.seti("uCloudN", t.cloud);
      quad.seti("uCloudLight", t.cloudLight);
      quad.seti("uHighCloud", t.highCloud);
      quad.setScale(scale);
      idleThrottle = device.mobile || ti <= 2;
    };
    const cssPixels = () => Math.max(1, canvas.clientWidth * canvas.clientHeight);
    governor = new Governor({
      tier,
      scale: remembered && remembered.tier === tier && forcedTier < 0 && startTier < 0 ? remembered.scale : undefined,
      maxTier,
      cssPixels: cssPixels(),
      timer: quad.hasTimer,
      fixed: forcedTier >= 0 || reduce,
      apply: (q) => {
        applyQuality(q);
        if (forcedTier < 0 && startTier < 0 && !reduce) writeStored({ renderer: device.renderer, tier: q.tier, scale: q.scale });
      },
      giveUp: () => {
        if (heroForced) return;
        writeStored({ renderer: device.renderer, fallback: true });
        if (tooSlowRef.current) tooSlowRef.current("slow");
      },
    });
    // a single still frame for reduced motion can afford full resolution
    if (reduce) governor.scale = 1;
    // ?scale=0.5 pins the resolution too (testing)
    if (forcedTier >= 0 && params.has("scale")) governor.scale = Math.min(1, Math.max(0.1, parseFloat(params.get("scale")) || 0.5));
    governor.commit();
    quad.set("uPageBg", 0.949, 0.973, 1.0);
    const blank = document.createElement("canvas");
    blank.width = blank.height = 2;
    quad.texture("uTitle", blank, 0);
    quad.texture("uNoise", makeNoise(), 1, { tiling: true });
    quad.set("uTitleRect", 0, 0, 1, 1);
    quad.set("uTitleZ", 20);
    quad.resize();

    const onResize = () => {
      governor.resize(cssPixels());
      if (reduce) quad.renderOnce();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const onPointer = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      lastActive = performance.now();
    };

    let io;
    if (reduce) {
      quad.renderOnce();
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            governor.pause(800);
            quad.start();
          } else quad.stop();
        },
        { rootMargin: "80px" },
      );
      io.observe(section);
    }
    const onVis = () => {
      if (reduce) return;
      if (document.hidden) quad.stop();
      else if (section.getBoundingClientRect().bottom > 0) {
        governor.pause(800);
        quad.start();
      }
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

        {hudOn && (
          <div
            ref={hudRef}
            aria-hidden="true"
            className="pointer-events-none fixed bottom-3 left-3 z-[80] rounded-lg bg-black/75 px-3 py-1.5 text-[12px] font-bold text-white"
          />
        )}

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
