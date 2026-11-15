import { useEffect, useRef } from "react";
import { useSceneryPaused } from "./sceneryPause";

// What is in the air of a world: gold bokeh at a gala, dust in stage light, steam over food, snow
// in the mountains, leaves on campus, paint at Impact Day. One canvas per world, drawing only
// while its world is on screen, never for anyone who asks for reduced motion, and not while the
// visitor has paused the scenery.

const PAINT = ["#f85a40", "#ffc845", "#0cb9c1", "#037ef3", "#f48924"];
const hash = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};
const noise1 = (x) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};

export default function Weather({ kind, density = 1, wind = 0, live }) {
  const ref = useRef(null);
  const paused = useSceneryPaused();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !live || paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = canvas.getContext("2d");
    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const parts = [];
    const area = () => (W * H) / (1440 * 900);
    // start with the air already full, rather than empty and filling
    const warm = { snow: 140, bokeh: 26, dust: 60, leaves: 6, steam: 10, spray: 0 }[kind] || 0;
    let last = performance.now();
    let raf = 0;
    const make = (k, t, fresh) => {
      const r = Math.random;
      switch (k) {
        case "snow":
          return { x: r() * (W + 200) - 100, y: fresh ? -10 : r() * H, r: 0.8 + r() * 2.4, vy: 30 + r() * 60, ph: r() * 6 };
        case "bokeh":
          return { x: r() * W, y: fresh ? H + 40 : r() * H, r: 10 + r() * 34, vy: -(6 + r() * 14), ph: r() * 6, a: 0.05 + r() * 0.12 };
        case "dust":
          return { x: r() * W, y: r() * H * 0.8, r: 0.6 + r() * 1.4, vy: -3 - r() * 7, life: fresh ? 1 : r(), ph: r() * 6 };
        case "steam":
          return { x: W * (0.3 + r() * 0.5), y: H * (0.8 + r() * 0.15), r: 30 + r() * 50, vy: -(16 + r() * 22), life: fresh ? 1 : 0.4 + r() * 0.6 };
        case "leaves":
          return { x: fresh ? -30 : r() * W, y: r() * H * 0.7, vx: 70 + r() * 110, vy: 16 + r() * 30, r: 4 + r() * 5, rot: r() * 6 };
        case "spray": {
          // flicked up and inwards from a brush at either side
          const ang = Math.PI * (0.22 + r() * 0.26);
          const sp = 260 + r() * 520;
          const left = r() < 0.5;
          return { x: left ? W * 0.04 : W * 0.96, y: H * 0.92, vx: Math.cos(ang) * sp * (left ? 1 : -1), vy: -Math.sin(ang) * sp, r: 1.5 + r() * 2.8, c: PAINT[Math.floor(r() * PAINT.length)], life: 1 };
        }
        default:
          return null;
      }
    };
    for (let i = 0; i < warm * density * area(); i++) parts.push(make(kind, 0, false));
    const rates = { snow: 70, bokeh: 3, dust: 18, steam: 9, leaves: 3, spray: 30 };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const gust = wind ? 40 + 220 * wind * Math.max(0, noise1(t * 0.4) - 0.35) : 12;
      const n = (rates[kind] || 0) * density * area() * dt;
      for (let i = 0; i < Math.floor(n) + (Math.random() < n % 1 ? 1 : 0); i++) parts.push(make(kind, t, true));
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        let dead = false;
        switch (kind) {
          case "snow":
            p.y += p.vy * dt;
            p.x += (gust + Math.sin(t * 1.3 + p.ph) * 26) * dt;
            ctx.fillStyle = "rgb(255 255 255 / 0.85)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 6.283);
            ctx.fill();
            dead = p.y > H + 10 || p.x > W + 30;
            break;
          case "bokeh": {
            p.y += p.vy * dt;
            p.x += Math.sin(t * 0.3 + p.ph) * 8 * dt;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, `rgb(255 214 120 / ${p.a})`);
            g.addColorStop(0.7, `rgb(255 200 80 / ${p.a * 0.8})`);
            g.addColorStop(1, "rgb(255 200 80 / 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 6.283);
            ctx.fill();
            dead = p.y < -60;
            break;
          }
          case "dust":
            p.y += p.vy * dt;
            p.x += Math.sin(t * 0.7 + p.ph) * 5 * dt;
            p.life -= dt * 0.12;
            ctx.fillStyle = `rgb(255 236 210 / ${0.55 * Math.max(0, Math.min(1, p.life * 3))})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 6.283);
            ctx.fill();
            dead = p.life <= 0;
            break;
          case "steam": {
            p.y += p.vy * dt;
            p.x += Math.sin(t + p.y * 0.01) * 9 * dt;
            p.r += 12 * dt;
            p.life -= dt * 0.22;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, `rgb(255 250 240 / ${0.16 * Math.max(0, p.life)})`);
            g.addColorStop(1, "rgb(255 250 240 / 0)");
            ctx.fillStyle = g;
            ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            dead = p.life <= 0;
            break;
          }
          case "leaves":
            p.x += (p.vx + gust * 0.5) * dt;
            p.y += (p.vy + Math.sin(t * 2 + p.rot) * 36) * dt;
            p.rot += dt * 2.6;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = "rgb(110 165 90 / 0.8)";
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, 6.283);
            ctx.fill();
            ctx.restore();
            dead = p.x > W + 40 || p.y > H + 40;
            break;
          case "spray":
            p.vy += 820 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 0.8;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 6.283);
            ctx.fill();
            ctx.globalAlpha = 1;
            dead = p.life <= 0 || p.y > H + 20;
            break;
          default:
            dead = true;
        }
        if (dead) parts.splice(i, 1);
      }
      if (parts.length > 700) parts.splice(0, parts.length - 700);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, W, H);
    };
  }, [kind, density, wind, live, paused]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
