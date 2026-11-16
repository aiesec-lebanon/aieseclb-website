import { useEffect, useRef, useState } from "react";

const fmt = new Intl.NumberFormat("en-US");
// a million and up is written short (1M): "1,000,000+" ran past its column
const short = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

// Rolls up to its value once, the first time it is seen. Reduced motion gets the final number.
export default function Counter({ value, suffix = "", duration = 1800 }) {
  const ref = useRef(null);
  const [n, setN] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? value : 0,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || n === value) return undefined;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setN(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {/* heard once, in full; the rolling digits are only to look at */}
      <span className="sr-only">
        {fmt.format(value)}
        {suffix}
      </span>
      <span aria-hidden="true">
        {(value >= 1e6 ? short : fmt).format(n)}
        {suffix}
      </span>
    </span>
  );
}
