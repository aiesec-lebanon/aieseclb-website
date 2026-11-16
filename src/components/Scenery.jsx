// THE SETS OF THE WORLDS (see World.jsx)
//
// Each set is drawn in CSS and SVG, in the colours of its world, and hangs in a window the size
// of the screen behind the scene's content. Elements marked data-depth move with the scroll
// through the scene (they come towards you as you walk in); classes starting with anim- move on
// their own. Neither runs when the visitor asks for reduced motion (index.css, "Worlds").

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a})`;
};
const mixHex = (p, q, t) => {
  const a = parseInt(p.slice(1), 16);
  const b = parseInt(q.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
// a fixed sequence of "random" numbers, so a set looks the same on every visit
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const COLOURS = ["#f85a40", "#ffc845", "#0cb9c1", "#037ef3", "#f48924", "#00c16e"];

function Svg({ children, anchor = "xMidYMid", className = "" }) {
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio={`${anchor} slice`} className={`absolute inset-0 h-full w-full ${className}`}>
      {children}
    </svg>
  );
}

// ------------------------------------------------------------------ events

// National Conference: a gala night. Light falling from a chandelier, a fan of gold rays, a
// polished floor.
function Gala({ world }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(60% 46% at 50% -8%, ${rgba(world.accent, 0.34)}, transparent 72%)` }} />
      <div
        data-depth=""
        className="absolute inset-[-12%]"
        style={{
          "--depth": 0.5,
          background: `repeating-conic-gradient(from 0deg at 50% 4%, ${rgba(world.accent, 0.09)} 0deg 0.5deg, transparent 0.5deg 4.5deg)`,
          maskImage: "radial-gradient(64% 72% at 50% 4%, #000 18%, transparent 74%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[34%]" style={{ background: `linear-gradient(transparent, ${rgba(world.accent, 0.12)})` }} />
      <div className="absolute inset-x-[20%] bottom-[6%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${rgba(world.accent, 0.5)}, transparent)` }} />
    </>
  );
}

// Youth Speak Forum: a stage. An LED wall of dots, two spotlights swinging, haze on the floor.
function Stage({ world }) {
  const beam = "conic-gradient(from 166deg at 50% 0%, transparent 0deg, rgb(255 236 214 / 0.20) 14deg, transparent 28deg, transparent 360deg)";
  return (
    <>
      <div
        data-depth=""
        className="absolute inset-0"
        style={{
          "--depth": 0.4,
          backgroundImage: `radial-gradient(${rgba(world.accent, 0.3)} 1.3px, transparent 1.8px)`,
          backgroundSize: "16px 16px",
          maskImage: "radial-gradient(58% 46% at 50% 36%, #000, transparent 78%)",
        }}
      />
      <div className="anim-swing absolute left-[2%] top-[-6%] h-[120%] w-[56%] origin-top" style={{ background: beam }} />
      <div className="anim-swing-late absolute right-[2%] top-[-6%] h-[120%] w-[56%] origin-top" style={{ background: beam }} />
      <div
        className="anim-fog absolute inset-x-[-10%] bottom-0 h-[42%]"
        style={{
          background: `radial-gradient(42% 60% at 24% 100%, ${rgba("#ffe0d0", 0.2)}, transparent 70%), radial-gradient(46% 56% at 74% 100%, ${rgba("#ffe0d0", 0.16)}, transparent 70%)`,
        }}
      />
    </>
  );
}

// Global Village: a market of the world. Bunting in every colour, a string of lights, a warm glow.
function Village({ world }) {
  const rnd = seeded(7);
  const sag = (x, top, depth) => top + depth * (1 - ((x - 800) / 860) ** 2);
  const flags = Array.from({ length: 17 }, (_, i) => {
    const x = 20 + i * 98;
    const y = sag(x, 30, 96);
    const slope = (sag(x + 1, 30, 96) - y) * 40;
    return { x, y, r: slope, c: COLOURS[Math.floor(rnd() * COLOURS.length)] };
  });
  const bulbs = Array.from({ length: 22 }, (_, i) => {
    const x = 10 + i * 75;
    return { x, y: sag(x, 190, 70) + 10 };
  });
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: `radial-gradient(70% 90% at 50% 100%, ${rgba(world.accent, 0.22)}, transparent 70%)` }} />
      <Svg anchor="xMidYMin">
        <g className="anim-sway" style={{ transformOrigin: "800px 0px" }}>
          <path d={`M0 ${sag(0, 30, 96)} ${Array.from({ length: 33 }, (_, i) => `L${i * 50} ${sag(i * 50, 30, 96)}`).join(" ")}`} stroke={rgba(world.ink, 0.5)} strokeWidth="2" fill="none" />
          {flags.map((f) => (
            <path key={f.x} d={`M${f.x - 26} ${f.y} L${f.x + 26} ${f.y} L${f.x} ${f.y + 56} Z`} fill={f.c} opacity="0.9" transform={`rotate(${f.r} ${f.x} ${f.y})`} />
          ))}
        </g>
        <g data-depth="" style={{ "--depth": -0.4 }}>
          <path d={`M0 ${sag(0, 190, 70)} ${Array.from({ length: 33 }, (_, i) => `L${i * 50} ${sag(i * 50, 190, 70)}`).join(" ")}`} stroke={rgba(world.ink, 0.35)} strokeWidth="1.5" fill="none" />
          {bulbs.map((b, i) => (
            <g key={b.x} className={i % 3 === 0 ? "anim-twinkle" : undefined} style={{ animationDelay: `${(i % 5) * 0.7}s` }}>
              <circle cx={b.x} cy={b.y} r="20" fill="#ffc845" opacity="0.22" />
              <circle cx={b.x} cy={b.y} r="6" fill="#ffe7a0" />
            </g>
          ))}
        </g>
      </Svg>
    </>
  );
}

// Leadership Development Days: the mountains in winter. Ridges one behind the other, cold light,
// mist in the valleys. (Snow comes from the weather.)
function ridge(seed, base, amp, step = 40) {
  const rnd = seeded(seed);
  let d = `M0 1000 L0 ${base}`;
  let y = base;
  for (let x = 0; x <= 1600; x += step) {
    y = Math.max(base - amp, Math.min(base + amp * 0.4, y + (rnd() - 0.52) * amp * 0.5));
    d += ` L${x} ${y.toFixed(0)}`;
  }
  return `${d} L1600 1000 Z`;
}
function Mountain({ world }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: "radial-gradient(50% 44% at 18% 0%, rgb(210 232 255 / 0.2), transparent 70%)" }} />
      <Svg anchor="xMidYMax">
        <g data-depth="" style={{ "--depth": 0.3 }}>
          <path d={ridge(11, 600, 150)} fill={mixHex(world.bg, "#dfeaf0", 0.32)} />
        </g>
        <g data-depth="" style={{ "--depth": 0.7 }}>
          <path d={ridge(23, 720, 120, 34)} fill={mixHex(world.bg, "#9fb8b0", 0.18)} />
        </g>
        <g data-depth="" style={{ "--depth": 1.3 }}>
          <path d={ridge(5, 840, 90, 28)} fill={mixHex(world.bg, "#000000", 0.35)} />
        </g>
      </Svg>
      <div className="anim-fog absolute inset-x-[-10%] bottom-[8%] h-[30%]" style={{ background: "radial-gradient(50% 50% at 30% 60%, rgb(230 240 245 / 0.18), transparent 70%), radial-gradient(40% 50% at 78% 50%, rgb(230 240 245 / 0.14), transparent 70%)" }} />
    </>
  );
}

// Recruitment Open Day: a campus morning. Sun through the trees, leaf shadows moving (the
// photograph carries the campus itself).
function Campus() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: "radial-gradient(34% 34% at 90% 4%, rgb(255 232 160 / 0.7), transparent 72%)" }} />
      <div
        className="anim-dapple absolute inset-[-10%]"
        style={{
          background:
            "radial-gradient(9% 7% at 20% 30%, rgb(255 255 255 / 0.5), transparent), radial-gradient(7% 6% at 34% 22%, rgb(255 255 255 / 0.4), transparent), radial-gradient(10% 8% at 72% 40%, rgb(255 255 255 / 0.45), transparent), radial-gradient(6% 5% at 84% 64%, rgb(255 255 255 / 0.4), transparent), radial-gradient(8% 6% at 12% 72%, rgb(255 255 255 / 0.35), transparent)",
        }}
      />
    </>
  );
}

// Impact Day: paint on the walls of the place being fixed up.
function splat(seed, cx, cy, r) {
  const rnd = seeded(seed);
  const n = 22;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = r * (0.8 + rnd() * 0.32) * (i % 5 === 0 ? 1.3 : 1);
    pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]);
  }
  // a smooth closed curve: through the midpoints, bending at each point
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const f = (v) => v.toFixed(1);
  let d = `M${mid(pts[n - 1], pts[0]).map(f).join(" ")} `;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(m[0])} ${f(m[1])} `;
  }
  const drops = Array.from({ length: 7 }, () => {
    const a = rnd() * Math.PI * 2;
    const k = r * (1.4 + rnd() * 0.9);
    return { x: cx + Math.cos(a) * k, y: cy + Math.sin(a) * k, r: 4 + rnd() * 10 };
  });
  return { d: `${d}Z`, drops, drip: { x: cx + (rnd() - 0.5) * r, y: cy + r * 0.6, l: 80 + rnd() * 160 } };
}
function Paint() {
  const splats = [
    { s: splat(3, 140, 160, 90), c: "#0cb9c1", depth: 0.6 },
    { s: splat(9, 1480, 230, 70), c: "#ffc845", depth: 0.9 },
    { s: splat(17, 1430, 820, 110), c: "#f85a40", depth: 1.2 },
    { s: splat(27, 210, 860, 75), c: "#037ef3", depth: 1 },
    { s: splat(41, 820, 70, 46), c: "#f48924", depth: 0.4 },
  ];
  return (
    <Svg>
      {splats.map(({ s, c, depth }) => (
        <g key={c} data-depth="" style={{ "--depth": depth }} fill={c} opacity="0.82">
          <path d={s.d} />
          {s.drops.map((p) => (
            <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r={p.r} />
          ))}
          <rect x={s.drip.x} y={s.drip.y} width="9" height={s.drip.l} rx="4.5" />
        </g>
      ))}
    </Svg>
  );
}

// ------------------------------------------------------------------ platforms

// The sign-up portal: the front door. An open doorway full of light that you walk towards.
function Door({ world }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(40% 50% at 50% 46%, ${rgba("#ffffff", 0.16)}, transparent 70%)` }} />
      <div data-depth="" className="absolute inset-0" style={{ "--depth": -1.2 }}>
        <div
          className="absolute left-1/2 top-[16%] h-[62%] w-[min(30vw,22rem)] -translate-x-1/2 rounded-t-[999px]"
          style={{ background: "linear-gradient(#ffffff, #fff4d6 70%, #ffc845)", boxShadow: `0 0 120px 30px ${rgba("#ffffff", 0.35)}, 0 0 260px 80px ${rgba(world.accent, 0.5)}` }}
        />
        <div
          className="absolute left-1/2 top-[78%] h-[22%] w-[min(90vw,64rem)] -translate-x-1/2"
          style={{ background: "linear-gradient(rgb(255 244 214 / 0.55), transparent)", clipPath: "polygon(37% 0, 63% 0, 100% 100%, 0 100%)" }}
        />
      </div>
    </>
  );
}

// Learn Git: Office Hours, Git drawn on a whiteboard. Commits and branches in marker that draw
// themselves as you walk in, sticky notes for the branches, HEAD in red.
function Whiteboard({ world }) {
  const marker = { fill: "none", stroke: world.ink, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" };
  const node = (x, y, k) => <circle key={k} cx={x} cy={y} r="15" fill="#ffffff" stroke={world.ink} strokeWidth="5" />;
  const note = (x, y, r, fill, text) => (
    <g transform={`rotate(${r} ${x} ${y})`}>
      <rect x={x - 70} y={y - 34} width="140" height="68" fill={fill} style={{ filter: "drop-shadow(0 6px 8px rgb(0 0 0 / 0.12))" }} />
      <text x={x} y={y + 9} textAnchor="middle" fontFamily='"Shantell Sans", cursive' fontWeight="700" fontSize="26" fill={world.ink}>
        {text}
      </text>
    </g>
  );
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${rgba(world.line, 0.55)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(world.line, 0.55)} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <Svg>
        <g data-depth="" style={{ "--depth": 0.5 }}>
          <path className="draw-on" pathLength="1" d="M120 170 L1480 170" {...marker} />
          <path className="draw-on" pathLength="1" d="M520 170 C580 170 600 300 680 300 L1060 300 C1140 300 1160 170 1220 170" {...marker} stroke={world.accent} />
          {[120, 320, 520, 1220, 1480].map((x) => node(x, 170, x))}
          {[760, 940].map((x) => node(x, 300, `f${x}`))}
          {note(300, 90, -4, "#FFE14D", "main")}
          {note(860, 386, 3, "#FFC2D4", "feature")}
          <g transform="rotate(-3 1480 92)">
            <path d="M1480 120 L1480 146" stroke="#C62E26" strokeWidth="5" strokeLinecap="round" />
            <path d="M1468 134 L1480 148 L1492 134" fill="none" stroke="#C62E26" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="1480" y="108" textAnchor="middle" fontFamily='"Shantell Sans", cursive' fontWeight="800" fontSize="30" fill="#C62E26">
              HEAD
            </text>
          </g>
        </g>
        <g data-depth="" style={{ "--depth": 1 }}>
          <text x="140" y="900" fontFamily='"JetBrains Mono Variable", monospace' fontSize="26" fill={rgba(world.ink, 0.55)}>
            $ git switch -c feature
          </text>
        </g>
      </Svg>
    </>
  );
}

// AIESEC XP: a studio set. A wall and floor that meet at a soft horizon, a spotlight on the
// floor, points rising in the colours of the funnel stages (in the bands above and below the
// content, never through it).
function Studio({ world }) {
  const chips = [
    { t: "+25 XP", c: "#037ef3", w: "#e2eeff", x: "8%", y: "13%", d: 0 },
    { t: "+10 XP", c: "#08704a", w: "#d9f4e6", x: "62%", y: "9%", d: 1.6 },
    { t: "Rank up", c: "#8a6108", w: "#fff1d0", x: "30%", y: "86%", d: 3.1 },
    { t: "+50 XP", c: "#b23a22", w: "#ffe4dd", x: "80%", y: "83%", d: 4.4 },
  ];
  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(${world.bg} 0%, #f4f1eb 66%, #e6e2da 66.3%, #f1eee8 66.6%, #e9e5dc 100%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{ background: "radial-gradient(36% 50% at 50% 46%, rgb(255 255 255 / 0.9), transparent 72%)" }} />
      <Svg anchor="xMidYMax">
        <g data-depth="" style={{ "--depth": 0.8 }}>
          {/* the road to the next reward, running into the set */}
          <path d="M700 1000 C760 880 860 820 800 700" fill="none" stroke="#e3dfd7" strokeWidth="28" strokeLinecap="round" />
          {[
            [716, 960, "#037ef3"],
            [800, 850, "#00c16e"],
            [830, 760, "#ffc845"],
            [802, 704, "#f85a40"],
          ].map(([x, y, c]) => (
            <circle key={x} cx={x} cy={y} r="12" fill={c} />
          ))}
        </g>
      </Svg>
      {chips.map((c) => (
        <span
          key={c.t}
          className="anim-rise absolute rounded-full px-4 py-2 text-[0.95rem] font-extrabold"
          style={{ left: c.x, top: c.y, background: c.w, color: c.c, animationDelay: `${c.d}s`, fontFamily: '"Figtree Variable", sans-serif' }}
        >
          {c.t}
        </span>
      ))}
    </>
  );
}

// AIESEC Pulse: the newsroom. A pulse running across the dark, a ticker of updates at the foot.
function Newsroom({ world }) {
  const line = "M0 520 L560 520 L600 520 L630 430 L668 640 L700 470 L724 540 L740 520 L1600 520";
  const words = ["Update", "Announcement", "Approved", "Pinned for your entity", "New this week", "Read by the committee"];
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(54% 40% at 50% 52%, ${rgba(world.accent, 0.14)}, transparent 72%)` }} />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 3px, rgb(255 255 255 / 0.025) 3px 4px)" }} />
      <Svg>
        <g data-depth="" style={{ "--depth": 0.4 }}>
          <path d={line} fill="none" stroke={rgba(world.accent, 0.22)} strokeWidth="3" />
          <path className="anim-pulse" d={line} pathLength="1" fill="none" stroke={world.accent} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${world.accent})` }} />
        </g>
      </Svg>
      <div className="absolute inset-x-0 bottom-[7%] overflow-clip border-y py-3" style={{ borderColor: rgba(world.ink, 0.12) }}>
        <div className="anim-ticker flex w-max gap-12 whitespace-nowrap" style={{ fontFamily: '"JetBrains Mono Variable", monospace', color: rgba(world.ink, 0.5) }}>
          {[...words, ...words, ...words].map((w, i) => (
            <span key={i} className="text-[0.9rem] uppercase tracking-[0.18em]">
              <span style={{ color: world.accent }}>●</span> {w}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// AIESEC Forms: paper and fields. Blank forms floating at the edges; a sheet filling up row by
// row at the side, because the answers go to your own sheet.
function FormCard({ fields, className, style }) {
  return (
    <div className={`absolute w-[15rem] rounded-2xl bg-white p-5 shadow-[0_18px_50px_rgb(16_24_40/0.12)] ${className}`} style={style}>
      <div className="h-3 w-24 rounded-full bg-[#037ef3]/80" />
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="mt-4">
          <div className="h-2 w-20 rounded-full bg-[#11141a]/20" />
          <div className="mt-2 h-8 rounded-lg border border-[#11141a]/15" />
        </div>
      ))}
    </div>
  );
}
// (side: where the text is; the props keep to the other side, behind the picture)
function Paper({ world, side }) {
  const away = side === "left" ? "right" : "left";
  return (
    <>
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${rgba(world.ink, 0.12)} 1px, transparent 1.4px)`, backgroundSize: "26px 26px" }} />
      <div data-depth="" className="absolute inset-0" style={{ "--depth": 0.8 }}>
        <FormCard fields={2} className={`anim-float top-[14%] -rotate-6 ${away === "left" ? "left-[-3rem] md:left-[2%]" : "right-[-3rem] md:right-[2%]"}`} />
      </div>
      <div data-depth="" className="absolute inset-0" style={{ "--depth": 1.3 }}>
        <div className={`absolute bottom-[7%] w-[19rem] -rotate-2 overflow-clip rounded-2xl bg-white shadow-[0_18px_50px_rgb(16_24_40/0.12)] ${away === "left" ? "left-[-4rem] md:left-[3%]" : "right-[-4rem] md:right-[3%]"}`}>
          <div className="flex h-9 items-center gap-2 bg-[#0f9d58] px-4">
            <span className="h-2 w-16 rounded-full bg-white/80" />
          </div>
          <div
            className="relative h-[17rem]"
            style={{
              backgroundImage: "linear-gradient(#11141a1f 1px, transparent 1px), linear-gradient(90deg, #11141a1f 1px, transparent 1px)",
              backgroundSize: "76px 28px",
            }}
          >
            <div className="anim-rows absolute inset-x-0 top-0 h-7 bg-[#037ef3]/15" />
          </div>
        </div>
      </div>
    </>
  );
}

// The partner portal: a showcase. A wall of partner tiles, deliverables ticking off as accepted.
function Showcase({ world }) {
  const rnd = seeded(5);
  const tiles = Array.from({ length: 18 }, (_, i) => ({ i, shape: Math.floor(rnd() * 3), done: rnd() > 0.55, d: rnd() * 6 }));
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 40%, ${rgba(world.accent, 0.16)}, transparent 75%)` }} />
      <div className="absolute inset-0 [perspective:1200px]">
        <div data-depth="" className="absolute inset-x-[-6%] top-[8%] grid grid-cols-6 gap-5 [transform:rotateX(14deg)]" style={{ "--depth": 0.7 }}>
          {tiles.map((t) => (
            <div key={t.i} className="relative grid aspect-[4/3] place-items-center rounded-2xl border shadow-[0_10px_30px_rgb(0_0_0/0.18)]" style={{ background: world.card, borderColor: world.line }}>
              <span
                style={{ background: rgba(world.ink, 0.14) }}
                className={`block h-8 w-8 ${t.shape === 0 ? "rounded-full" : t.shape === 1 ? "rounded-md" : "rotate-45 rounded-sm"}`}
              />
              {t.done && (
                <span
                  className="anim-pop absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-[0.8rem] font-black text-white"
                  style={{ background: world.accent, animationDelay: `${t.d}s` }}
                >
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// The membership portal: "Leadership starts with a decision". Steps rising into light.
function Ascent({ world }) {
  const steps = Array.from({ length: 9 }, (_, i) => i);
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(40% 42% at 78% 8%, ${rgba(world.accent, 0.4)}, transparent 72%)` }} />
      <Svg anchor="xMidYMax">
        <g data-depth="" style={{ "--depth": 0.8 }}>
          {steps.map((i) => (
            <rect
              key={i}
              x={360 + i * 130}
              y={900 - i * 70}
              width={1600}
              height={80}
              fill={mixHex(world.bg, "#ffffff", 0.04 + i * 0.012)}
            />
          ))}
          {steps.map((i) => (
            <rect key={`e${i}`} x={360 + i * 130} y={900 - i * 70} width={1600} height={2} fill={rgba(world.accent, 0.25 + i * 0.06)} />
          ))}
        </g>
      </Svg>
    </>
  );
}

// This website: the dawn it opens with. Stars, and the edge of a sun coming up as you scroll.
function Dawn({ world }) {
  const rnd = seeded(13);
  const stars = Array.from({ length: 70 }, () => ({ x: rnd() * 1600, y: rnd() * 560, r: 0.6 + rnd() * 1.6, o: 0.3 + rnd() * 0.6 }));
  return (
    <>
      <Svg>
        {stars.map((s) => (
          <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
        ))}
      </Svg>
      <div data-depth="" className="absolute inset-0" style={{ "--depth": -1.4 }}>
        <div
          className="absolute left-1/2 top-[74%] aspect-square w-[180vw] -translate-x-1/2 rounded-full md:w-[130vw]"
          style={{
            background: `radial-gradient(closest-side, ${world.bg} 0%, #06215a 88%, #0b63d6 96.5%, #ffd27a 99.2%, #fff3cf 100%)`,
            boxShadow: "0 -18px 70px rgb(255 200 69 / 0.5), 0 -60px 180px rgb(3 126 243 / 0.5)",
          }}
        />
      </div>
    </>
  );
}

const SCENERY = {
  gala: Gala,
  stage: Stage,
  village: Village,
  mountain: Mountain,
  campus: Campus,
  paint: Paint,
  door: Door,
  whiteboard: Whiteboard,
  studio: Studio,
  newsroom: Newsroom,
  paper: Paper,
  showcase: Showcase,
  ascent: Ascent,
  dawn: Dawn,
};

export default function Scenery({ name, world, side = "left" }) {
  const Set = SCENERY[name];
  return Set ? <Set world={world} side={side} /> : null;
}
