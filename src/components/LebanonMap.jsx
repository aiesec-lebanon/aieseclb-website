import { KM50, OUTLINE, PLACES, SUMMIT, VIEW } from "./lebanonOutline";

// Lebanon, drawn as you come to it: the outline traces itself in gold, then the places come up one
// after another, the summit, the sea, and a 50 km bar to show how small it all is. Fully drawn from
// the start for anyone who asks for reduced motion (index.css, "Lebanon map").
export default function LebanonMap({ className = "" }) {
  const [W, H] = VIEW;
  return (
    <figure className={`lebanon-map ${className}`}>
      <svg viewBox={`-70 -10 ${W + 150} ${H + 60}`} className="h-full w-full overflow-visible" role="img" aria-labelledby="lb-map-title">
        <title id="lb-map-title">Map of Lebanon with Beirut, Byblos, Tripoli, Sidon, Tyre, the Cedars and Baalbek</title>
        <defs>
          <radialGradient id="lb-land" cx="45%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#0f2f66" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#081a3d" stopOpacity="0.6" />
          </radialGradient>
          <filter id="lb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <text x="-58" y={H * 0.56} className="fill-white/55 text-[16px] italic max-md:text-[21px]" transform={`rotate(-72 -58 ${H * 0.56})`}>
          Mediterranean Sea
        </text>
        <path d={OUTLINE} fill="url(#lb-land)" className="map-fill" />
        <path d={OUTLINE} pathLength="1" fill="none" stroke="#ffc845" strokeWidth="5" opacity="0.35" filter="url(#lb-glow)" className="map-draw" />
        <path d={OUTLINE} pathLength="1" fill="none" stroke="#ffc845" strokeWidth="1.8" strokeLinejoin="round" className="map-draw" />
        {/* the summit */}
        <g className="map-pin" style={{ "--n": 8 }}>
          <path d={`M${SUMMIT[0]} ${SUMMIT[1] - 9} l7 12 h-14 Z`} fill="#ffffff" />
          <text x={SUMMIT[0] + 12} y={SUMMIT[1] + 3} className="fill-white/80 text-[14px] max-md:text-[20px]">
            3,088 m
          </text>
        </g>
        {PLACES.map((p, i) => (
          <g key={p.name} className="map-pin" style={{ "--n": i }}>
            <circle cx={p.at[0]} cy={p.at[1]} r="11" fill="#ffc845" opacity="0.2" />
            <circle cx={p.at[0]} cy={p.at[1]} r="5" fill="#ffc845" />
            <text
              x={p.at[0] + (p.side === "left" ? -12 : 12)}
              y={p.at[1] + 5}
              textAnchor={p.side === "left" ? "end" : "start"}
              className="fill-white text-[19px] font-bold max-md:text-[22px]"
            >
              {p.name}
            </text>
          </g>
        ))}
        {/* 50 km */}
        <g className="map-pin" style={{ "--n": 9 }} transform={`translate(${W - KM50 + 40} ${H + 30})`}>
          <path d={`M0 0 H${KM50} M0 -5 V5 M${KM50} -5 V5`} stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />
          <text x={KM50 / 2} y="-10" textAnchor="middle" className="fill-white/80 text-[14px] max-md:text-[20px]">
            50 km
          </text>
        </g>
      </svg>
    </figure>
  );
}
