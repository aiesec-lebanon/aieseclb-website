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
  // A label goes beside its city, away from the other one; where that would run out of the
  // drawing (a city near the edge, a long name), it goes under the dot instead, kept inside.
  const label = (p, other, name) => {
    const w = name.length * 8.6; // about how wide 15 px bold is
    const side = labelSide(p, other);
    const fits = side === "end" ? p[0] - 14 - w >= 0 : p[0] + 14 + w <= W;
    if (fits) return { x: p[0] + (side === "end" ? -14 : 14), y: p[1] + 5, anchor: side };
    return { x: Math.min(Math.max(p[0], w / 2), W - w / 2), y: p[1] + 26, anchor: "middle" };
  };
  // the arrowhead at the destination, along the curve as it arrives (a quadratic's end tangent)
  const tx = b[0] - mid[0];
  const ty = b[1] - mid[1];
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const head = [
    [b[0] - ux * 4, b[1] - uy * 4],
    [b[0] - ux * 17 - uy * 7, b[1] - uy * 17 + ux * 7],
    [b[0] - ux * 17 + uy * 7, b[1] - uy * 17 - ux * 7],
  ]
    .map((q) => q.map((v) => v.toFixed(1)).join(","))
    .join(" ");
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
      {/* which way it goes: a head at the destination, arriving as the line does */}
      <polygon className="route-head" points={head} fill="#ffc845" />
      {[
        [a, from, b],
        [b, to, a],
      ].map(([p, place, other]) => (
        <g key={place.city}>
          <circle cx={p[0]} cy={p[1]} r="10" fill="#ffc845" opacity="0.18" />
          <circle cx={p[0]} cy={p[1]} r="4.5" fill="#ffc845" />
          {(() => {
            const l = label(p, other, place.city);
            return (
              <text x={l.x} y={l.y} textAnchor={l.anchor} className="fill-current text-[15px] font-bold">
                {place.city}
              </text>
            );
          })()}
        </g>
      ))}
    </svg>
  );
}
