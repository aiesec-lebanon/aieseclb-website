// A drawn interface that stands in for a platform until its real screenshot is added to
// src/assets/gen/. It is an SVG, so it stays sharp at any size and costs almost nothing.
// Everything on it is generic on purpose: no real names, no real numbers.

const C = {
  bg: "#f2f8ff",
  panel: "#ffffff",
  ink: "#0b1b33",
  soft: "#8a9ab3",
  line: "#dfe9f5",
  blue: "#037ef3",
  blueDark: "#06519c",
  night: "#06142e",
  sun: "#ffc845",
  ember: "#f85a40",
  teal: "#0cb9c1",
};

function rand(seed) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Bar = ({ x, y, w, h = 14, c = C.line, r = 7 }) => <rect x={x} y={y} width={w} height={h} rx={r} fill={c} />;

function Sidebar({ r }) {
  return (
    <g>
      <rect width="250" height="1000" fill={C.night} />
      <rect x="36" y="40" width="44" height="44" rx="12" fill={C.blue} />
      <Bar x={96} y={54} w={110} h={16} c="#ffffff" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="24" y={140 + i * 64} width="202" height="48" rx="14" fill={i === 1 ? C.blue : "transparent"} />
          <circle cx="54" cy={164 + i * 64} r="9" fill={i === 1 ? "#fff" : "#40557a"} />
          <Bar x={78} y={157 + i * 64} w={70 + r() * 70} c={i === 1 ? "#ffffff" : "#40557a"} />
        </g>
      ))}
      <circle cx="58" cy="930" r="22" fill={C.sun} />
      <Bar x={94} y={916} w={96} c="#ffffff" />
      <Bar x={94} y={940} w={64} h={10} c="#40557a" />
    </g>
  );
}

function Dashboard({ seed }) {
  const r = rand(seed);
  const pts = Array.from({ length: 14 }, (_, i) => [330 + i * 62, 640 - (120 + r() * 170 + i * 9)]);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(0)} ${y.toFixed(0)}`).join(" ");
  const accent = [C.blue, C.teal, C.ember];
  return (
    <>
      <rect width="1600" height="1000" fill={C.bg} />
      <Sidebar r={r} />
      <Bar x={300} y={52} w={260} h={26} c={C.ink} r={8} />
      <rect x="1180" y="40" width="250" height="50" rx="25" fill={C.panel} stroke={C.line} strokeWidth="2" />
      <Bar x={1206} y={58} w={120} c={C.line} />
      <circle cx="1510" cy="65" r="25" fill={C.blue} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${300 + i * 420} 130)`}>
          <rect width="390" height="170" rx="26" fill={C.panel} />
          <Bar x={30} y={32} w={120} c={C.soft} h={12} />
          <text x="30" y="112" fontFamily="Archivo Variable, Lato, sans-serif" fontWeight="800" fontSize="58" fill={C.ink}>
            {String(Math.floor(40 + r() * 900))}
          </text>
          <rect x="250" y="30" width="110" height="34" rx="17" fill={accent[i]} opacity="0.14" />
          <Bar x={270} y={41} w={70} h={12} c={accent[i]} />
          <path
            d={`M30 140 ${Array.from({ length: 9 }, (_, k) => `L${30 + k * 41} ${140 - r() * 26}`).join(" ")}`}
            fill="none"
            stroke={accent[i]}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <rect x="300" y="330" width="830" height="400" rx="26" fill={C.panel} />
      <Bar x={330} y={362} w={190} h={18} c={C.ink} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="330" x2="1100" y1={440 + i * 66} y2={440 + i * 66} stroke={C.line} strokeWidth="2" />
      ))}
      <path d={`${path} L${pts[pts.length - 1][0]} 700 L330 700 Z`} fill={C.blue} opacity="0.10" />
      <path d={path} fill="none" stroke={C.blue} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[9][0]} cy={pts[9][1]} r="13" fill={C.panel} stroke={C.blue} strokeWidth="7" />
      <rect x="1160" y="330" width="390" height="400" rx="26" fill={C.blue} />
      <Bar x={1190} y={364} w={150} h={16} c="#ffffff" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const h = 60 + r() * 200;
        return <rect key={i} x={1196 + i * 48} y={690 - h} width="28" height={h} rx="10" fill={i === 4 ? C.sun : "#ffffff"} opacity={i === 4 ? 1 : 0.55} />;
      })}
      <rect x="300" y="760" width="1250" height="200" rx="26" fill={C.panel} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(330 ${790 + i * 54})`}>
          <circle cx="18" cy="18" r="18" fill={accent[i]} opacity="0.9" />
          <Bar x={54} y={11} w={180 + r() * 120} c={C.ink} />
          <Bar x={420} y={11} w={160 + r() * 90} />
          <Bar x={760} y={11} w={120} />
          <rect x="1070" y="2" width="120" height="32" rx="16" fill={accent[i]} opacity="0.14" />
          <Bar x={1092} y={12} w={76} h={12} c={accent[i]} />
        </g>
      ))}
    </>
  );
}

function Form() {
  const fields = ["Full name", "University", "Email", "Phone"];
  return (
    <>
      <rect width="1600" height="1000" fill={C.panel} />
      <rect width="700" height="1000" fill={C.blue} />
      <circle cx="560" cy="1010" r="330" fill={C.sun} />
      <path d="M0 1000 L0 760 L160 690 L300 780 L430 700 L560 790 L700 730 L700 1000 Z" fill={C.blueDark} />
      <text x="70" y="250" fontFamily="Archivo Variable, Lato, sans-serif" fontWeight="800" fontSize="104" fill="#fff">
        <tspan x="70">Start your</tspan>
        <tspan x="70" dy="104">exchange.</tspan>
      </text>
      <Bar x={70} y={420} w={420} c="#ffffff" h={16} />
      <Bar x={70} y={456} w={330} c="#ffffff" h={16} />
      <text x="790" y="150" fontFamily="Archivo Variable, Lato, sans-serif" fontWeight="800" fontSize="54" fill={C.ink}>
        Tell us about you
      </text>
      {fields.map((f, i) => (
        <g key={f} transform={`translate(${790 + (i % 2) * 380} ${210 + Math.floor(i / 2) * 150})`}>
          <text fontFamily="Lato, sans-serif" fontWeight="700" fontSize="24" fill={C.soft} y="22">
            {f}
          </text>
          <rect y="40" width="350" height="72" rx="18" fill={C.bg} stroke={C.line} strokeWidth="2" />
          <Bar x={24} y={69} w={140 + i * 26} c="#b9c8de" />
        </g>
      ))}
      <text x="790" y="548" fontFamily="Lato, sans-serif" fontWeight="700" fontSize="24" fill={C.soft}>
        I want to
      </text>
      {["Volunteer", "Intern", "Teach", "Join"].map((p, i) => (
        <g key={p} transform={`translate(${790 + i * 184} 572)`}>
          <rect width="166" height="64" rx="32" fill={i === 0 ? C.blue : C.bg} stroke={i === 0 ? C.blue : C.line} strokeWidth="2" />
          <text x="83" y="41" textAnchor="middle" fontFamily="Lato, sans-serif" fontWeight="700" fontSize="24" fill={i === 0 ? "#fff" : C.ink}>
            {p}
          </text>
        </g>
      ))}
      <rect x="790" y="700" width="730" height="84" rx="42" fill={C.sun} />
      <text x="1155" y="753" textAnchor="middle" fontFamily="Lato, sans-serif" fontWeight="900" fontSize="30" fill={C.ink}>
        Sign up
      </text>
      <Bar x={950} y={830} w={410} h={12} />
    </>
  );
}

function Site() {
  return (
    <>
      <defs>
        <linearGradient id="mock-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030b1c" />
          <stop offset="0.55" stopColor="#0a4aa8" />
          <stop offset="0.8" stopColor="#ffb86b" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#mock-sky)" />
      <circle cx="1090" cy="640" r="96" fill="#ffd27a" />
      <path d="M0 1000 L0 640 L140 560 L300 650 L470 570 L640 660 L820 600 L980 680 L1150 610 L1330 690 L1480 600 L1600 660 L1600 1000 Z" fill="#1f57a8" />
      <path d="M0 1000 L0 730 L220 660 L420 740 L650 690 L900 770 L1150 700 L1380 780 L1600 720 L1600 1000 Z" fill="#0c3170" />
      <path d="M0 1000 L0 830 L300 790 L700 850 L1100 800 L1600 860 L1600 1000 Z" fill="#061b40" />
      <rect x="60" y="44" width="1480" height="76" rx="38" fill="#030b1c" opacity="0.6" />
      <Bar x={100} y={72} w={150} h={20} c="#ffffff" />
      {[0, 1, 2, 3].map((i) => (
        <Bar key={i} x={640 + i * 130} y={75} w={90} h={14} c="#9fb4d6" />
      ))}
      <rect x="1380" y="58" width="140" height="48" rx="24" fill={C.sun} />
      <text x="90" y="330" fontFamily="Archivo Variable, Lato, sans-serif" fontWeight="800" fontSize="170" fill="#fff">
        <tspan x="90">Hope rises</tspan>
        <tspan x="90" dy="160">in Lebanon</tspan>
      </text>
      <rect x="1150" y="880" width="190" height="64" rx="32" fill={C.sun} />
      <rect x="1360" y="880" width="180" height="64" rx="32" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    </>
  );
}

function Board({ seed }) {
  const r = rand(seed);
  const cols = [C.blue, C.sun, C.teal, C.ember];
  return (
    <>
      <rect width="1600" height="1000" fill={C.bg} />
      <Sidebar r={r} />
      <Bar x={300} y={52} w={300} h={26} c={C.ink} r={8} />
      <rect x="1330" y="40" width="220" height="52" rx="26" fill={C.blue} />
      <Bar x={1372} y={59} w={136} c="#ffffff" />
      {cols.map((c, i) => (
        <g key={i} transform={`translate(${300 + i * 318} 130)`}>
          <rect width="296" height="830" rx="26" fill="#e6f0fb" />
          <circle cx="34" cy="38" r="10" fill={c} />
          <Bar x={56} y={30} w={110} h={16} c={C.ink} />
          {Array.from({ length: 3 + Math.floor(r() * 2) }, (_, k) => {
            const h = 120 + Math.floor(r() * 3) * 34;
            const y = 76 + k * 184;
            return (
              <g key={k} transform={`translate(18 ${y})`}>
                <rect width="260" height={h} rx="20" fill={C.panel} />
                <Bar x={20} y={22} w={150 + r() * 60} c={C.ink} />
                <Bar x={20} y={50} w={190} h={11} />
                <Bar x={20} y={70} w={120 + r() * 60} h={11} />
                <circle cx="36" cy={h - 30} r="15" fill={c} opacity="0.85" />
                <circle cx="62" cy={h - 30} r="15" fill={C.night} opacity="0.75" />
                <rect x="170" y={h - 44} width="70" height="26" rx="13" fill={c} opacity="0.16" />
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
}

function Calendar({ seed }) {
  const r = rand(seed);
  return (
    <>
      <rect width="1600" height="1000" fill={C.bg} />
      <Sidebar r={r} />
      <Bar x={300} y={52} w={240} h={26} c={C.ink} r={8} />
      <rect x="300" y="130" width="840" height="830" rx="26" fill={C.panel} />
      {Array.from({ length: 35 }, (_, i) => {
        const x = 330 + (i % 7) * 112;
        const y = 220 + Math.floor(i / 7) * 142;
        const ev = r() > 0.72;
        return (
          <g key={i}>
            <rect x={x} y={y} width="100" height="128" rx="16" fill={i === 17 ? C.blue : C.bg} />
            <Bar x={x + 14} y={y + 16} w={22} h={12} c={i === 17 ? "#ffffff" : C.soft} />
            {ev && <rect x={x + 12} y={y + 78} width="76" height="30" rx="10" fill={[C.sun, C.teal, C.ember][i % 3]} />}
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Bar key={i} x={354 + i * 112} y={176} w={52} h={12} c={C.soft} />
      ))}
      <rect x="1170" y="130" width="380" height="470" rx="26" fill={C.night} />
      <rect x="1170" y="130" width="380" height="210" rx="26" fill={C.blue} />
      <circle cx="1460" cy="340" r="70" fill={C.sun} />
      <Bar x={1204} y={390} w={210} h={20} c="#ffffff" />
      <Bar x={1204} y={428} w={280} h={12} c="#40557a" />
      <Bar x={1204} y={452} w={230} h={12} c="#40557a" />
      <rect x="1204" y="510" width="312" height="60" rx="30" fill={C.sun} />
      <rect x="1170" y="630" width="380" height="330" rx="26" fill={C.panel} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(1200 ${668 + i * 70})`}>
          <circle cx="20" cy="20" r="20" fill={[C.blue, C.teal, C.ember, C.sun][i]} />
          <Bar x={58} y={8} w={150 + r() * 90} c={C.ink} />
          <Bar x={58} y={30} w={110} h={10} />
        </g>
      ))}
    </>
  );
}

export default function MockScreen({ kind = "dashboard", seed = 1, label }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      className="absolute inset-0 block h-full w-full"
    >
      {kind === "form" && <Form />}
      {kind === "site" && <Site />}
      {kind === "board" && <Board seed={seed} />}
      {kind === "calendar" && <Calendar seed={seed} />}
      {kind === "dashboard" && <Dashboard seed={seed} />}
    </svg>
  );
}
