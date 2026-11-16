// A journey drawn as a line on a strip of map: two cities on a faint graticule, a gold arc between
// them that traces itself as the story comes into view (index.css, "Routes"). The projection is a
// plain longitude and latitude window around the two cities, wide enough to breathe.
export default function Route({ from, to, className = "" }) {
  const W = 420;
  const H = 150;
  const pad = 42;
  const lons = [from.at[0], to.at[0]];
  const lats = [from.at[1], to.at[1]];
  const spanLon = Math.max(12, Math.abs(lons[0] - lons[1]));
  const spanLat = Math.max(8, Math.abs(lats[0] - lats[1]));
  const cx = (lons[0] + lons[1]) / 2;
  const cy = (lats[0] + lats[1]) / 2;
  const k = Math.min((W - 2 * pad) / spanLon, (H - 2 * pad) / spanLat);
  const P = ([lon, lat]) => [W / 2 + (lon - cx) * k, H / 2 - (lat - cy) * k];
  const a = P(from.at);
  const b = P(to.at);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - Math.max(24, len * 0.32)];
  const labelSide = (p, other) => (p[0] <= other[0] ? "end" : "start");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`route w-full overflow-visible ${className}`} role="img" aria-label={`From ${from.city}, ${from.country} to ${to.city}, ${to.country}`}>
      {/* the graticule: a hint of a map */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={(i * W) / 8} y1="0" x2={(i * W) / 8} y2={H} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 6" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={(i * H) / 3} x2={W} y2={(i * H) / 3} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 6" />
      ))}
      <path d={`M${a[0]} ${a[1]} Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`} fill="none" stroke="#ffc845" strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round" />
      <path className="route-draw" pathLength="1" d={`M${a[0]} ${a[1]} Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`} fill="none" stroke="#ffc845" strokeWidth="2" strokeLinecap="round" />
      {[
        [a, from, b],
        [b, to, a],
      ].map(([p, place, other]) => (
        <g key={place.city}>
          <circle cx={p[0]} cy={p[1]} r="10" fill="#ffc845" opacity="0.18" />
          <circle cx={p[0]} cy={p[1]} r="4.5" fill="#ffc845" />
          <text
            x={p[0] + (labelSide(p, other) === "end" ? -14 : 14)}
            y={p[1] + 5}
            textAnchor={labelSide(p, other)}
            className="fill-current text-[15px] font-bold"
          >
            {place.city}
          </text>
        </g>
      ))}
    </svg>
  );
}
