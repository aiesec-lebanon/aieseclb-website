import { useEffect, useRef } from "react";

// Marks a block as "in" once it enters the viewport. The CSS in index.css does the motion
// (lines rising out of a mask, soft fades) and leaves everything visible when motion is reduced.
export default function Reveal({ as = "div", className = "", delay = 0, once = true, children, ...rest }) {
  const Tag = as;
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          if (once) io.disconnect();
        } else if (!once) {
          el.classList.remove("is-in");
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return (
    <Tag ref={ref} data-reveal="" className={className} style={delay ? { "--d": `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}

// Splits a heading into masked lines: <Lines text={["First line", "Second line"]} />
export function Lines({ text, className = "" }) {
  const lines = Array.isArray(text) ? text : [text];
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={`rl ${className}`} style={{ "--i": i }}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}
