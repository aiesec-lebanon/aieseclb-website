import { useEffect, useRef, useState } from "react";
import Scenery from "./Scenery";
import Weather from "./Weather";
import { setSceneryPaused, useSceneryPaused } from "./sceneryPause";

// WALKING THROUGH WORLDS
//
// On the events and platforms pages every event and every platform is a world of its own: its
// colours, its type, its light and its weather, so that scrolling down the page is walking from
// one world into the next rather than reading a list.
//
// A World is one tall scene. Its set (Scenery.jsx) hangs in a window the size of the screen that
// stays where it is while the scene scrolls past; the next world comes up over it like the view
// through a door you are walking towards, and where two worlds meet, the colour of the one behind
// runs into the one ahead. The nav takes on the scheme of the world under it (data-scheme).
//
// A world, written in the content files:
//   scheme      "dark" | "light"
//   bg, ink, soft, accent, accentInk, line, card     its colours (soft and accentInk are for
//               text: both keep 4.5:1 on bg)
//   scenery     which set (a key of SCENERY)
//   weather     { kind, density, wind } in the air, optional (Weather.jsx)
//   font        the type of its headings: a key of FONTS (worldType.js)
//   frame       how its picture hangs: plain, gold, polaroid, taped, window
// A scene can also pass a backdrop (Backdrop.jsx: its photograph continued behind it, in 3D),
// drawn under the set.


export default function World({ world, from, id, label, backdrop = null, textSide = "left", className = "", children }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "15% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      data-scheme={world.scheme}
      className={`world relative isolate ${className}`}
      style={{
        "--w-bg": world.bg,
        "--w-from": from || world.bg,
        "--w-ink": world.ink,
        "--w-soft": world.soft,
        "--w-accent": world.accent,
        "--w-accent-ink": world.accentInk,
        "--w-line": world.line,
        "--w-card": world.card,
        background: world.bg,
        color: world.ink,
      }}
    >
      {/* the window onto this world's set */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <div className={`world-set sticky top-0 h-[100lvh] overflow-clip ${live ? "is-live" : ""}`}>
          {live ? backdrop : null}
          {live ? <Scenery name={world.scenery} world={world} side={textSide} /> : null}
          {world.weather && <Weather {...world.weather} live={live} />}
        </div>
      </div>
      {/* where the world behind runs into this one, and where this one runs into the next */}
      <div aria-hidden="true" className="world-seam pointer-events-none absolute inset-x-0 top-0 -z-[5] h-[42svh]" />
      <div aria-hidden="true" className="world-fade pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-[26svh]" />
      {children}
    </section>
  );
}

// The switch for every moving set and the weather. It stays at the foot of the screen while the
// worlds are in view; nothing moves for anyone who asks for reduced motion, so it hides then.
export function SceneryToggle() {
  const paused = useSceneryPaused();
  // shown once the worlds fill a good part of the screen: at the top of the page their container
  // already reaches into view, and the button sat over the ring above them
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const worlds = ref.current && ref.current.parentElement;
    if (!worlds) return undefined;
    const io = new IntersectionObserver(([e]) => setShown(e.isIntersecting), { rootMargin: "0px 0px -45% 0px" });
    io.observe(worlds);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`scenery-toggle pointer-events-none sticky bottom-4 z-30 -mt-14 flex h-14 justify-end px-4 transition-opacity duration-500 md:bottom-6 md:px-6 ${shown ? "opacity-100" : "invisible opacity-0"}`}
    >
      <button
        type="button"
        onClick={() => setSceneryPaused(!paused)}
        aria-pressed={paused}
        className="pointer-events-auto inline-flex h-11 min-w-11 items-center justify-center gap-2 self-end rounded-full border border-white/20 bg-night/75 px-3 md:px-4 text-[0.92rem] font-bold text-white backdrop-blur-md transition-colors hover:bg-night"
      >
        <span aria-hidden="true" className="grid h-4 w-4 place-items-center">
          {paused ? (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
              <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />
            </svg>
          )}
        </span>
        <span className="max-md:sr-only">{paused ? "Play the scenery" : "Pause the scenery"}</span>
      </button>
    </div>
  );
}

// How a photograph hangs in its world.
const FRAMES = {
  plain: "rounded-[1.4rem] shadow-[0_40px_110px_rgb(0_0_0/0.45)] md:rounded-[1.8rem]",
  gold: "rounded-[0.4rem] p-2 shadow-[0_40px_110px_rgb(0_0_0/0.5)] ring-1 ring-[var(--w-accent)]/60 bg-[var(--w-card)]",
  polaroid: "rotate-[1.6deg] rounded-[0.3rem] bg-white p-3 pb-12 shadow-[0_30px_70px_rgb(40_20_0/0.18)] md:p-4 md:pb-16",
  taped: "-rotate-[1.2deg] rounded-[0.2rem] bg-white p-2 shadow-[0_26px_60px_rgb(0_0_0/0.16)]",
  window: "rounded-[1rem] shadow-[0_40px_110px_rgb(0_0_0/0.35)] md:rounded-[1.4rem]",
  // a stage screen: a dark bezel with the light of the screen on it
  bezel: "rounded-[1rem] bg-[#0a0a0a] p-2 shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_40px_110px_rgb(0_0_0/0.6),0_0_80px_rgb(255_120_90/0.12)] md:rounded-[1.3rem] md:p-2.5",
  // a print in a white mat, as in a cabin
  mat: "rounded-[0.35rem] bg-[#f4f1ea] p-3 shadow-[0_34px_90px_rgb(0_0_0/0.5)] md:p-4",
};
export function Frame({ world, children }) {
  const kind = world.frame || "plain";
  return (
    <div className={`relative ${FRAMES[kind] || FRAMES.plain}`}>
      {kind === "taped" && (
        <>
          <span aria-hidden="true" className="absolute -top-3 left-[12%] h-7 w-24 -rotate-6 bg-[#f6e7b0]/85 shadow-sm" />
          <span aria-hidden="true" className="absolute -top-3 right-[10%] h-7 w-20 rotate-[8deg] bg-[#f6e7b0]/85 shadow-sm" />
        </>
      )}
      <div className={kind === "plain" || kind === "window" ? "overflow-clip rounded-[inherit]" : kind === "bezel" ? "overflow-clip rounded-[0.7rem]" : "overflow-clip rounded-[0.2rem]"}>{children}</div>
    </div>
  );
}
