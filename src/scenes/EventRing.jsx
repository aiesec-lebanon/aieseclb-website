import { useEffect, useRef, useState } from "react";
import {
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { genSmall } from "../lib/media";
import Arrow from "../components/Arrow";

const TONES = {
  dawn: ["#06224f", "#0a5cc4", "#ffb86b", "#3d7fd0", "#0c3170"],
  day: ["#0468d9", "#2e97f7", "#cfe8ff", "#4f93dc", "#0c4a8f"],
  night: ["#030b1c", "#06224f", "#0b4a9e", "#0a2a5e", "#04122c"],
  cedar: ["#0468d9", "#58b0ff", "#e4f3ff", "#3f8f74", "#0c4a36"],
  ember: ["#7a1f1a", "#f85a40", "#ffd08a", "#8f2f22", "#3a120f"],
  teal: ["#064b55", "#0cb9c1", "#d6fbf6", "#157a82", "#063338"],
  tangerine: ["#7a3c06", "#f48924", "#ffe3b0", "#955013", "#3b1f07"],
};

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Each panel is a poster: the event's photograph (or a code-made landscape until one is added)
// with its name set into the bottom.
async function makePoster(event, index) {
  const W = 640;
  const H = 1120;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const url = genSmall(event.image) || (event.stand ? genSmall(event.stand) : null);
  const img = url ? await loadImage(url) : null;
  if (img) {
    const s = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  } else {
    const t = TONES[event.tone] || TONES.dawn;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, t[0]);
    g.addColorStop(0.48, t[1]);
    g.addColorStop(0.7, t[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    let seed = index * 7919 + 13;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    ctx.fillStyle = "#ffe2a0";
    ctx.beginPath();
    ctx.arc(140 + rnd() * 360, H * 0.6, 92, 0, Math.PI * 2);
    ctx.fill();
    [t[3], t[4]].forEach((col, k) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      let y = H * (0.62 + k * 0.1);
      for (let x = 0; x <= W; x += W / (10 + k * 6)) {
        y += (rnd() - 0.5) * 70;
        y = Math.min(Math.max(y, H * (0.52 + k * 0.1)), H * (0.72 + k * 0.1));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    });
  }
  const shade = ctx.createLinearGradient(0, H * 0.45, 0, H);
  shade.addColorStop(0, "rgba(3,11,28,0)");
  shade.addColorStop(1, "rgba(3,11,28,0.88)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ffc845";
  ctx.font = '700 30px "Lato", sans-serif';
  ctx.fillText(event.kind, 44, H - 190);
  ctx.fillStyle = "#fff";
  let size = 92;
  const words = event.name.split(" ");
  const lines = [];
  const fit = () => {
    ctx.font = `800 condensed ${size}px "Archivo Variable", "Lato", sans-serif`;
    lines.length = 0;
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (ctx.measureText(next).width > W - 88 && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    lines.push(line);
  };
  fit();
  while (lines.length > 2 && size > 54) {
    size -= 8;
    fit();
  }
  const lh = size * 0.92;
  lines.forEach((l, i) => ctx.fillText(l, 44, H - 150 + size * 0.8 + i * lh - (lines.length - 1) * lh * 0.5 + 20));

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

const VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = `
uniform sampler2D uMap; uniform vec3 uCam; uniform float uAspect; uniform float uLit; uniform float uMirror;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  // rounded corners, measured in the panel's own proportions
  vec2 q = abs(vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 hs = vec2(uAspect, 1.0) * 0.5;
  float r = 0.035;
  vec2 d = q - (hs - r);
  float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
  float a = 1.0 - smoothstep(-0.004, 0.004, sd);
  if (a < 0.01) discard;
  float face = clamp(dot(normalize(vN), normalize(uCam - vP)), 0.0, 1.0);
  vec3 col = texture2D(uMap, vUv).rgb;
  // panels dim as they turn away, the one in front is fully lit
  col *= mix(0.28, 1.0, pow(face, 1.6)) * mix(0.7, 1.0, uLit);
  // the reflection on the floor: the poster's lower part, fading away from the floor line
  if (uMirror > 0.5) {
    a *= 0.30 * smoothstep(0.42, 0.0, vUv.y);
    col *= 0.75;
  }
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

export default function EventRing({ events }) {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const api = useRef({ step: () => {} });
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mount = mountRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setFailed(true));
      return undefined;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "absolute inset-0 h-full w-full touch-pan-y";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 60);
    const ring = new Group();
    scene.add(ring);

    // A wide, shallow arc: a big cylinder of which only the front sixth is ever in frame, so
    // about seven posters sit across the screen and bend away at the sides.
    const COUNT = Math.max(24, events.length * 4);
    const R = 7.2;
    const HGT = 2.6;
    const stepAngle = (Math.PI * 2) / COUNT;
    const span = stepAngle * 0.9;
    const arc = R * span;
    const geo = new CylinderGeometry(R, R, HGT, 20, 1, true, -span / 2, span);
    const panels = [];
    let alive = true;

    for (let i = 0; i < COUNT; i++) {
      const mat = new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uMap: { value: null },
          uCam: { value: new Vector3() },
          uAspect: { value: arc / HGT },
          uLit: { value: 0 },
          uMirror: { value: 0 },
        },
        transparent: true,
        side: DoubleSide,
      });
      // the same poster again, upside down under the floor line, as its reflection
      const reflMat = mat.clone();
      reflMat.uniforms.uMirror.value = 1;
      reflMat.depthWrite = false;
      const holder = new Group();
      holder.rotation.y = i * stepAngle;
      const panel = new Mesh(geo, mat);
      const refl = new Mesh(geo, reflMat);
      refl.scale.y = -1;
      refl.position.y = -HGT - 0.05;
      holder.add(panel, refl);
      holder.visible = false;
      ring.add(holder);
      panels.push({ mesh: holder, mat, reflMat });
    }
    Promise.all([
      document.fonts.load('800 condensed 60px "Archivo Variable"').catch(() => {}),
      document.fonts.load('700 30px "Lato"').catch(() => {}),
    ]).then(async () => {
      const textures = await Promise.all(events.map((e, i) => makePoster(e, i)));
      if (!alive) {
        textures.forEach((t) => t.dispose());
        return;
      }
      const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures.forEach((t) => (t.anisotropy = maxAniso));
      panels.forEach((p, i) => {
        p.mat.uniforms.uMap.value = textures[i % events.length];
        p.reflMat.uniforms.uMap.value = textures[i % events.length];
      });
      panels.textures = textures;
    });

    let width = 1;
    let height = 1;
    const resize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
      // far enough that the front poster, which steps forward and grows, has air above and below;
      // on a narrow screen, far enough that it is not wider than the screen
      // the posters fill the upper part of the frame, with their reflection on the floor below
      const dist = Math.max((HGT * 0.5 + 0.4) / tanHalf, (arc * 0.62) / (tanHalf * camera.aspect));
      camera.position.set(0, 0.06, R + dist);
      camera.lookAt(0, -0.42, R);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // angle is "how many panels have gone past"; target snaps to whole panels
    let pos = 0;
    let target = 0;
    let vel = 0;
    let dragging = false;
    let lastX = 0;
    let lastActive = -1;
    let scrollTilt = 0;

    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      vel = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const perPanel = Math.max(120, width / (camera.aspect > 1 ? 6.4 : 1.6));
      target -= dx / perPanel;
      vel = -dx / perPanel;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      target = Math.round(target + vel * 4);
    };
    const el = renderer.domElement;
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.style.cursor = "grab";

    api.current.step = (n) => {
      target = Math.round(target) + n;
    };

    let raf = 0;
    let running = false;
    let last = 0;
    const frame = (now) => {
      if (running) raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      pos = reduce ? target : pos + (target - pos) * (1 - Math.exp(-dt * (dragging ? 14 : 6)));
      const r = wrap.getBoundingClientRect();
      const through = 1 - (r.top + r.height / 2) / window.innerHeight; // -0.x .. 1.x as it scrolls by
      scrollTilt = reduce ? 0 : (through - 0.5) * 0.5;
      ring.rotation.y = -pos * stepAngle + scrollTilt * 0.35;
      ring.rotation.x = 0.05 + scrollTilt * 0.06;
      const front = ((Math.round(pos) % COUNT) + COUNT) % COUNT;
      panels.forEach((p, i) => {
        p.mat.uniforms.uCam.value.copy(camera.position);
        const lit = i === front ? 1 : 0;
        p.mat.uniforms.uLit.value += (lit - p.mat.uniforms.uLit.value) * (reduce ? 1 : 0.12);
        // the poster facing us steps forward: largest and nearest, its neighbours a little less
        let away = Math.abs(i - (((pos % COUNT) + COUNT) % COUNT));
        away = Math.min(away, COUNT - away);
        const lift = 1 + 0.07 * Math.exp(-away * away * 1.4);
        p.mesh.scale.set(lift, lift, lift);
        // the far side of the cylinder is never shown
        p.mesh.visible = Boolean(p.mat.uniforms.uMap.value) && away < COUNT * 0.24;
      });
      const idx = front % events.length;
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
      renderer.render(scene, camera);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          last = 0;
          raf = requestAnimationFrame(frame);
        } else if (!e.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(wrap);

    return () => {
      alive = false;
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      panels.forEach((p) => {
        p.mat.dispose();
        p.reflMat.dispose();
      });
      (panels.textures || []).forEach((t) => t.dispose());
      geo.dispose();
      renderer.dispose();
      el.remove();
    };
  }, [events]);

  const current = events[active];
  const onKey = (e) => {
    if (e.key === "ArrowLeft") api.current.step(-1);
    if (e.key === "ArrowRight") api.current.step(1);
  };

  if (failed) return null;

  return (
    <div ref={wrapRef} className="relative">
      <div ref={mountRef} className="relative h-[52svh] min-h-[22rem]" />
      <div className="shell relative z-10 flex flex-col items-center gap-5 pb-10 pt-2 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div aria-live="polite" className="min-h-[5.5rem] md:max-w-[34rem]">
          <p className="display text-[clamp(1.8rem,3vw,2.8rem)]">{current.name}</p>
          <p className="mt-2 text-white/75">{current.line}</p>
        </div>
        <div className="flex items-center gap-3" role="group" aria-label="Turn the ring of events" onKeyDown={onKey}>
          <button
            type="button"
            aria-label="Previous event"
            onClick={() => api.current.step(-1)}
            className="grid h-13 w-13 place-items-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-ink"
          >
            <Arrow className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next event"
            onClick={() => api.current.step(1)}
            className="grid h-13 w-13 place-items-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-ink"
          >
            <Arrow />
          </button>
          <a
            href={`#${current.id}`}
            className="ml-2 inline-flex h-13 items-center rounded-full bg-sun px-6 font-bold text-ink transition-colors hover:bg-white"
          >
            Read about it
          </a>
        </div>
      </div>
    </div>
  );
}
