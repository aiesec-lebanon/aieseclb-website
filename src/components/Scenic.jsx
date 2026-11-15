import { useMemo } from "react";
import { genImage } from "../lib/media";

// Code-made landscape used wherever a generated photograph has not been added yet: a sky, a sun
// and a few ridges, all derived from a seed so every placeholder is different but related.
function rand(seed) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TONES = {
  dawn: { sky: ["#06224f", "#0a5cc4", "#ffb86b"], ridges: ["#3d7fd0", "#1f57a8", "#0c3170", "#061b40"], sun: "#ffd27a" },
  day: { sky: ["#0468d9", "#2e97f7", "#cfe8ff"], ridges: ["#8fc0f3", "#4f93dc", "#1f6ac0", "#0c4a8f"], sun: "#fff3c4" },
  night: { sky: ["#030b1c", "#06224f", "#0b4a9e"], ridges: ["#0f3a7d", "#0a2a5e", "#071d44", "#04122c"], sun: "#ffc845" },
  cedar: { sky: ["#0468d9", "#58b0ff", "#e4f3ff"], ridges: ["#7fb7a6", "#3f8f74", "#1c6b4f", "#0c4a36"], sun: "#fff3c4" },
  ember: { sky: ["#7a1f1a", "#f85a40", "#ffd08a"], ridges: ["#c2452f", "#8f2f22", "#5f1e18", "#3a120f"], sun: "#ffe2a8" },
  teal: { sky: ["#064b55", "#0cb9c1", "#d6fbf6"], ridges: ["#35a4ab", "#157a82", "#0b545b", "#063338"], sun: "#f6fffb" },
  tangerine: { sky: ["#7a3c06", "#f48924", "#ffe3b0"], ridges: ["#c96f1c", "#955013", "#63340c", "#3b1f07"], sun: "#fff0c9" },
};

function ridgePath(r, w, h, base, amp, steps) {
  let d = `M0 ${h}`;
  let y = base;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    y += (r() - 0.5) * amp;
    y = Math.min(Math.max(y, base - amp * 1.6), base + amp * 0.9);
    pts.push([(i / steps) * w, y]);
  }
  pts.forEach(([x, yy], i) => {
    d += i === 0 ? ` L${x.toFixed(1)} ${yy.toFixed(1)}` : ` L${x.toFixed(1)} ${yy.toFixed(1)}`;
  });
  return `${d} L${w} ${h} Z`;
}

export function Scenic({ seed = 1, tone = "dawn", className = "" }) {
  const art = useMemo(() => {
    const r = rand(seed * 9973 + 17);
    const w = 400;
    const h = 500;
    const horizon = 250 + r() * 70;
    const sunX = 90 + r() * 220;
    const ridges = [0, 1, 2, 3].map((i) =>
      ridgePath(r, w, h, horizon + i * 42 + r() * 18, 26 - i * 3, 14 + i * 6),
    );
    return { w, h, horizon, sunX, ridges };
  }, [seed]);
  const t = TONES[tone] || TONES.dawn;
  const id = `sc-${seed}-${tone}`;
  return (
    <svg
      viewBox={`0 0 ${art.w} ${art.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`block h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.sky[0]} />
          <stop offset="0.5" stopColor={t.sky[1]} />
          <stop offset="0.72" stopColor={t.sky[2]} />
        </linearGradient>
      </defs>
      <rect width={art.w} height={art.h} fill={`url(#${id})`} />
      <circle cx={art.sunX} cy={art.horizon - 6} r="44" fill={t.sun} />
      {art.ridges.map((d, i) => (
        <path key={i} d={d} fill={t.ridges[i]} />
      ))}
    </svg>
  );
}

// <Media name="lebanon-cedars" alt="..." /> shows src/assets/gen/lebanon-cedars.* when it exists.
export default function Media({
  name,
  alt = "",
  seed = 1,
  tone = "dawn",
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}) {
  const img = genImage(name);
  return (
    <div className={`relative overflow-clip bg-night-800 ${className}`} data-media={name} data-filled={img ? "true" : "false"}>
      {img ? (
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes={img.srcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div role={alt ? "img" : undefined} aria-label={alt || undefined} className={`absolute inset-0 ${imgClassName}`}>
          <Scenic seed={seed} tone={tone} />
        </div>
      )}
    </div>
  );
}
