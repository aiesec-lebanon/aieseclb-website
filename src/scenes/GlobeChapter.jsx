import { useEffect, useRef, useState } from "react";
import {
  CanvasTexture,
  Color,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  CatmullRomCurve3,
  BackSide,
  AdditiveBlending,
} from "three";
import { feature } from "topojson-client";
import countries from "world-atlas/countries-110m.json";
import { clamp01, mix, sectionProgress, smoothstep } from "../lib/scroll";

const DEG = Math.PI / 180;
const BEIRUT = { lat: 33.89, lon: 35.5 };

// Places the arcs reach. They are an illustration of reach, not a list of partner offices.
const PLACES = [
  { lat: 52.52, lon: 13.4 }, // Berlin
  { lat: 48.86, lon: 2.35 }, // Paris
  { lat: 41.01, lon: 28.98 }, // Istanbul
  { lat: 30.04, lon: 31.24 }, // Cairo
  { lat: 40.42, lon: -3.7 }, // Madrid
  { lat: 52.23, lon: 21.01 }, // Warsaw
  { lat: -1.29, lon: 36.82 }, // Nairobi
  { lat: 19.08, lon: 72.88 }, // Mumbai
  { lat: -23.55, lon: -46.63 }, // Sao Paulo
  { lat: 19.43, lon: -99.13 }, // Mexico City
  { lat: 43.65, lon: -79.38 }, // Toronto
  { lat: -6.21, lon: 106.85 }, // Jakarta
  { lat: 35.68, lon: 139.69 }, // Tokyo
  { lat: 4.71, lon: -74.07 }, // Bogota
  { lat: 6.52, lon: 3.38 }, // Lagos
  { lat: 38.72, lon: -9.14 }, // Lisbon
];

const toVec = (lat, lon, r = 1) => {
  const la = lat * DEG;
  const lo = lon * DEG;
  return new Vector3(Math.cos(la) * Math.cos(lo) * r, Math.sin(la) * r, -Math.cos(la) * Math.sin(lo) * r);
};

// The land is drawn as a field of dots, the halftone of the AIESEC brand illustrations.
function makeEarthTexture() {
  const land = feature(countries, countries.objects.countries);

  // 1. a small mask to ask "is this point land?"
  const MW = 720;
  const MH = 360;
  const mask = document.createElement("canvas");
  mask.width = MW;
  mask.height = MH;
  const mctx = mask.getContext("2d", { willReadFrequently: true });
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, MW, MH);
  mctx.fillStyle = "#fff";
  const drawRing = (ring) => {
    // unwrap longitudes so rings that cross the date line do not streak across the map
    let prev = ring[0][0];
    let shift = 0;
    const pts = ring.map(([lon, lat]) => {
      if (lon - prev > 180) shift -= 360;
      else if (lon - prev < -180) shift += 360;
      prev = lon;
      return [lon + shift, lat];
    });
    for (const off of [-360, 0, 360]) {
      mctx.beginPath();
      pts.forEach(([lon, lat], i) => {
        const x = ((lon + off + 180) / 360) * MW;
        const y = ((90 - lat) / 180) * MH;
        if (i === 0) mctx.moveTo(x, y);
        else mctx.lineTo(x, y);
      });
      mctx.closePath();
      mctx.fill();
    }
  };
  for (const f of land.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) drawRing(poly[0]);
  }
  const md = mctx.getImageData(0, 0, MW, MH).data;
  const isLand = (lat, lon) => {
    const x = Math.min(MW - 1, Math.max(0, Math.floor(((lon + 180) / 360) * MW)));
    const y = Math.min(MH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MH)));
    return md[(y * MW + x) * 4] > 120;
  };

  // 2. the dots, spaced evenly on the sphere rather than on the flat map
  const W = 2048;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  const step = 1.18;
  const r = (step / 180) * H * 0.33;
  ctx.fillStyle = "#ffffff";
  for (let lat = -58; lat <= 84; lat += step) {
    const stretch = 1 / Math.max(0.12, Math.cos(lat * DEG));
    const lonStep = step * stretch;
    const offset = (Math.round(lat / step) % 2) * lonStep * 0.5;
    for (let lon = -180 + offset; lon < 180; lon += lonStep) {
      if (!isLand(lat, lon)) continue;
      const x = ((lon + 180) / 360) * W;
      const y = ((90 - lat) / 180) * H;
      ctx.beginPath();
      ctx.ellipse(x, y, r * stretch, r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Lebanon: one dot, in the colour of the sun
  {
    const { lat, lon } = { lat: 33.9, lon: 35.85 };
    const stretch = 1 / Math.cos(lat * DEG);
    const x = ((lon + 180) / 360) * W;
    const y = ((90 - lat) / 180) * H;
    ctx.fillStyle = "#0468c9";
    ctx.beginPath();
    ctx.ellipse(x, y, r * 3.3 * stretch, r * 3.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffc845";
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.2 * stretch, r * 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

const GLOBE_VERT = `
varying vec3 vN; varying vec3 vP; varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const GLOBE_FRAG = `
uniform sampler2D uMap; uniform vec3 uLight; uniform vec3 uCam;
varying vec3 vN; varying vec3 vP; varying vec2 vUv;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vP);
  float sunSide = dot(N, normalize(uLight));
  float lit = smoothstep(-0.25, 0.55, sunSide);
  vec3 ocean = mix(vec3(0.004, 0.030, 0.110), vec3(0.012, 0.250, 0.640), lit);
  vec4 t = texture2D(uMap, vUv);
  vec3 land = t.rgb * mix(0.22, 1.0, lit);
  vec3 col = mix(ocean, land, t.a * 0.96);
  // on the night side the land is dark, and its towns are lit
  float night = 1.0 - smoothstep(-0.12, 0.22, sunSide);
  vec2 g = floor(vUv * vec2(1100.0, 550.0));
  float h = fract(sin(dot(g, vec2(12.9898, 78.233))) * 43758.5453);
  col += vec3(1.0, 0.74, 0.34) * step(0.982, h) * t.a * night * 1.3;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  col += vec3(0.40, 0.70, 1.00) * fres * 0.34;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const AIR_FRAG = `
uniform vec3 uCam; varying vec3 vN; varying vec3 vP;
void main() {
  vec3 V = normalize(uCam - vP);
  float f = pow(clamp(dot(normalize(vN), -V), 0.0, 1.0), 3.2);
  gl_FragColor = vec4(vec3(0.62, 0.84, 1.0) * f * 0.55, f);
}`;

const ARC_VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const ARC_FRAG = `
uniform float uT; uniform vec3 uColor; uniform float uDir;
varying vec2 vUv;
void main() {
  float x = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
  if (x > uT) discard;
  float head = smoothstep(0.16, 0.0, uT - x) * step(uT, 0.999);
  float tail = 0.55 + 0.45 * x;
  gl_FragColor = vec4(uColor * (tail + head * 0.9), 1.0);
  #include <colorspace_fragment>
}`;

function buildArc(from, to) {
  const a = from.clone().normalize();
  const b = to.clone().normalize();
  const angle = a.angleTo(b);
  const lift = Math.min(0.24, 0.035 + angle * 0.085);
  const pts = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = a.clone().lerp(b, t).normalize();
    // true slerp for long arcs
    const s = Math.sin(angle);
    if (s > 1e-4) {
      p.copy(a)
        .multiplyScalar(Math.sin((1 - t) * angle) / s)
        .add(b.clone().multiplyScalar(Math.sin(t * angle) / s));
    }
    p.multiplyScalar(1.004 + Math.sin(Math.PI * t) * lift);
    pts.push(p);
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), 72, 0.0048, 6, false);
}

const BEATS = [
  { id: "g0", in: [-1, -0.5], out: [0.1, 0.18] },
  { id: "g1", in: [0.26, 0.33], out: [0.5, 0.57] },
  { id: "g2", in: [0.6, 0.67], out: [0.9, 0.97] },
];

export default function GlobeChapter() {
  const sectionRef = useRef(null);
  const mountRef = useRef(null);
  const labelRef = useRef(null);
  const beatRefs = useRef({});
  const [mode, setMode] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "still" : "gl",
  );

  useEffect(() => {
    const section = sectionRef.current;
    const mount = mountRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setMode("fallback"));
      return undefined;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 50);
    const tilt = new Group();
    const spin = new Group();
    tilt.add(spin);
    scene.add(tilt);

    const earthTex = makeEarthTexture();
    earthTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const globeMat = new ShaderMaterial({
      vertexShader: GLOBE_VERT,
      fragmentShader: GLOBE_FRAG,
      uniforms: { uMap: { value: earthTex }, uLight: { value: new Vector3(0.6, 0.55, 0.9) }, uCam: { value: new Vector3() } },
    });
    const globeGeo = new SphereGeometry(1, 96, 64);
    spin.add(new Mesh(globeGeo, globeMat));

    const airMat = new ShaderMaterial({
      vertexShader: GLOBE_VERT,
      fragmentShader: AIR_FRAG,
      uniforms: { uCam: { value: new Vector3() } },
      side: BackSide,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const airGeo = new SphereGeometry(1.085, 64, 48);
    tilt.add(new Mesh(airGeo, airMat));

    const home = toVec(BEIRUT.lat, BEIRUT.lon);
    const arcs = PLACES.map((p, i) => {
      const geo = buildArc(home, toVec(p.lat, p.lon));
      const incoming = i % 2 === 1;
      const mat = new ShaderMaterial({
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        uniforms: {
          uT: { value: 0 },
          uDir: { value: incoming ? -1 : 1 },
          uColor: { value: new Color(incoming ? "#ffffff" : "#ffc845") },
        },
      });
      const mesh = new Mesh(geo, mat);
      spin.add(mesh);
      return { mesh, mat, geo, incoming, order: Math.floor(i / 2) / (PLACES.length / 2) };
    });

    // rotation that brings Lebanon to face the camera
    const faceY = (-90 - BEIRUT.lon) * DEG;
    const faceX = BEIRUT.lat * DEG;

    let width = 1;
    let height = 1;
    const resize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let p = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    const tmp = new Vector3();
    const forced = new URLSearchParams(window.location.search).get("g");

    const frame = (now) => {
      if (running) raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const target = forced != null ? clamp01(parseFloat(forced)) : reduce ? 0.72 : sectionProgress(section);
      p = dt === 0 || reduce || forced != null ? target : p + (target - p) * (1 - Math.exp(-dt * 7));

      const wide = width / height > 1;
      // the globe arrives as a point and grows
      const grow = smoothstep(0.0, 0.2, p);
      const scale = mix(0.16, 1, 1 - Math.pow(1 - grow, 3));
      tilt.scale.setScalar(scale);
      // it turns until Lebanon faces us, then keeps a slow drift
      const turn = smoothstep(0.04, 0.34, p);
      const eased = 1 - Math.pow(1 - turn, 3);
      spin.rotation.y = faceY + (1 - eased) * 2.5 + (p - 0.5) * 0.3 + (reduce ? 0 : Math.sin(now / 9000) * 0.02);
      tilt.rotation.x = mix(0.12, faceX * 0.8, eased);
      // it steps aside for the words
      const side = wide ? smoothstep(0.2, 0.34, p) * (1 - smoothstep(0.52, 0.66, p) * 2) : 0;
      tilt.position.x = side * 0.62;
      tilt.position.y = wide ? 0 : 0.42;
      // distance: fit the globe to the short side of the frame, then ease closer
      const fit = wide ? 0.6 : 0.82;
      const tanHalf = Math.tan((camera.fov * DEG) / 2);
      const distH = 1 / (tanHalf * fit);
      const distW = 1 / (tanHalf * camera.aspect * fit);
      camera.position.set(0, 0, Math.max(distH, distW) * mix(1, 0.86, smoothstep(0.3, 0.95, p)));
      camera.lookAt(0, 0, 0);
      globeMat.uniforms.uCam.value.copy(camera.position);
      airMat.uniforms.uCam.value.copy(camera.position);

      const out = smoothstep(0.3, 0.54, p);
      const inn = smoothstep(0.6, 0.86, p);
      for (const a of arcs) {
        const t = a.incoming ? inn : out;
        a.mat.uniforms.uT.value = clamp01((t - a.order * 0.45) / 0.55);
        a.mesh.visible = a.mat.uniforms.uT.value > 0.001;
      }

      renderer.render(scene, camera);

      // the name sits beside its dot, and hides when the dot turns away
      const label = labelRef.current;
      if (label) {
        tmp.copy(home).multiplyScalar(1.01);
        spin.localToWorld(tmp);
        const facing = tmp.clone().sub(tilt.position).normalize().dot(camera.position.clone().normalize());
        tmp.project(camera);
        const x = (tmp.x * 0.5 + 0.5) * width;
        const y = (-tmp.y * 0.5 + 0.5) * height;
        label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        label.style.opacity = (smoothstep(0.25, 0.5, facing) * smoothstep(0.24, 0.34, p)).toFixed(3);
      }

      for (const b of BEATS) {
        const el = beatRefs.current[b.id];
        if (!el) continue;
        const o = reduce ? 1 : smoothstep(b.in[0], b.in[1], p) * (1 - smoothstep(b.out[0], b.out[1], p));
        const lift = reduce ? 0 : (1 - smoothstep(b.in[0], b.in[1], p)) * 30 - smoothstep(b.out[0], b.out[1], p) * 30;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${lift.toFixed(1)}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let io;
    if (reduce) {
      requestAnimationFrame(frame);
    } else {
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "120px" });
      io.observe(section);
    }
    const onVis = () => {
      if (reduce) return;
      if (document.hidden) stop();
      else {
        const r = section.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) start();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      arcs.forEach((a) => {
        a.geo.dispose();
        a.mat.dispose();
      });
      globeGeo.dispose();
      globeMat.dispose();
      airGeo.dispose();
      airMat.dispose();
      earthTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const pinned = mode === "gl";
  const setBeat = (id) => (el) => {
    beatRefs.current[id] = el;
  };

  return (
    <section
      ref={sectionRef}
      className={`relative text-white ${pinned ? "h-[440vh]" : ""}`}
      aria-label="From Lebanon to the world, and from the world to Lebanon"
    >
      <div
        className={`${pinned ? "sticky top-0" : "relative"} h-svh min-h-[36rem] overflow-clip bg-[radial-gradient(120%_90%_at_50%_45%,#1590ff_0%,#037ef3_34%,#0554b0_72%,#06346f_100%)]`}
      >
        {/* first light behind the world, top right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_46%_at_88%_6%,rgb(255_214_120/0.42),rgb(255_190_90/0.12)_45%,transparent_72%)]"
        />
        <div ref={mountRef} className="absolute inset-0" />

        <div
          ref={labelRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
        >
          <span className="display ml-5 block -translate-y-1/2 text-[1.5rem] text-sun [text-shadow:0_1px_10px_rgb(3_20_60/0.9),0_0_2px_rgb(3_20_60/0.9)] md:text-[1.9rem]">
            Lebanon
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[13vh]">
          <div ref={setBeat("g0")} className="shell text-center will-change-transform">
            <h2 className="display text-mega mx-auto max-w-[14ch]">The world is closer than it looks from here.</h2>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end md:items-center">
          <div className="shell pb-[7vh] md:pb-0">
            <div
              ref={setBeat("g1")}
              style={pinned ? { opacity: 0, visibility: "hidden" } : undefined}
              className="max-w-[30rem] will-change-transform"
            >
              <h3 className="display text-title text-sun">From Lebanon, out.</h3>
              <p className="text-lead mt-5 text-white/92">
                Every year young people leave Beirut for a few weeks or a few months of work that matters, somewhere
                they have never been.
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end md:items-center">
          <div className="shell flex pb-[7vh] md:justify-end md:pb-0">
            <div
              ref={setBeat("g2")}
              style={pinned ? { opacity: 0, visibility: "hidden" } : undefined}
              className="max-w-[30rem] will-change-transform"
            >
              <h3 className="display text-title">From everywhere, in.</h3>
              <p className="text-lead mt-5 text-white/92">
                And every year others arrive: to volunteer, to teach, to work, and to find out what Lebanon is
                actually like.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
