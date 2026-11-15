import { useEffect, useRef, useState } from "react";
import { sectionProgress } from "../lib/scroll";

// Vertical scrolling drives a horizontal journey: the section pins, and its track slides sideways
// by exactly its own overflow. On touch screens and with reduced motion it becomes an ordinary
// swipeable row, which is what a thumb expects anyway.
export default function HorizontalStory({ children, className = "", label }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [pinned] = useState(
    () =>
      window.matchMedia("(pointer: fine) and (min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [span, setSpan] = useState(0);

  useEffect(() => {
    if (!pinned) return undefined;
    const track = trackRef.current;
    const measure = () => setSpan(Math.max(0, track.scrollWidth - window.innerWidth));
    // the observer reports the first size itself, so no measurement is forced here
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  useEffect(() => {
    if (!pinned) return undefined;
    const section = sectionRef.current;
    const track = trackRef.current;
    let raf = 0;
    let x = 0;
    let running = false;
    const tick = () => {
      if (running) raf = requestAnimationFrame(tick);
      const p = sectionProgress(section);
      const target = -p * span;
      x += (target - x) * 0.14;
      if (Math.abs(target - x) < 0.05) x = target;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.02, p).toFixed(4)})`;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pinned, span]);

  return (
    <section
      ref={sectionRef}
      aria-label={label}
      className={className}
      style={pinned ? { height: `calc(100svh + ${span}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-svh flex-col justify-center overflow-clip" : "overflow-x-auto overscroll-x-contain"}>
        <div ref={trackRef} className="flex w-max items-stretch will-change-transform">
          {children}
        </div>
        {pinned && (
          <div className="shell absolute inset-x-0 bottom-7">
            <div className="h-1 w-40 overflow-clip rounded-full bg-current/15">
              <div ref={barRef} className="h-full origin-left rounded-full bg-current" style={{ transform: "scaleX(0.02)" }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
