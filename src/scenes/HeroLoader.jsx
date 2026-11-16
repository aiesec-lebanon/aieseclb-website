// While the realistic dawn is being prepared (its shader compiled, its first frames drawn), the
// page is still before dawn: a horizon line draws itself across the dark as the scene gets
// ready, and the top of the sun comes up over it. When the scene is ready the sky and the sea
// part from the horizon, the upper half lifting and the lower half falling away, and the real
// dawn is behind them.
//
// `progress` (0 to 1) is real: it moves with the stages DawnHeroReal reports. Everything moves by
// transform and opacity only, so it keeps moving even while the GPU holds the page up. Under
// reduced motion it is a plain fade.
// `creep`: while the shader compiles (seconds, with nothing to report) the line keeps moving,
// slowly, towards its target, so the wait never looks stuck.
export default function HeroLoader({ progress, open, creep = false }) {
  const p = Math.max(0.04, Math.min(1, progress));
  return (
    <div
      aria-hidden="true"
      className={`hero-loader pointer-events-none absolute inset-0 z-20 ${open ? "is-open" : ""}`}
      style={{ "--p": p.toFixed(3), "--dur": creep ? "6s" : "0.9s" }}
    >
      {/* the sky and the sea, which part when the dawn is ready */}
      <div className="hero-loader__sky absolute inset-x-0 top-0 h-[58%] overflow-clip bg-[linear-gradient(180deg,#02060f_0%,#06142e_70%,#0b2350_100%)]">
        {/* the sun, rising with the work done */}
        <div className="hero-loader__sun absolute bottom-0 left-1/2 aspect-square w-[min(22vw,9rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_40%,#fff3cf_0%,#ffd27a_45%,#f4a340_100%)] shadow-[0_0_60px_18px_rgb(255_200_69/0.35)]" />
      </div>
      <div className="hero-loader__sea absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,#0b2350_0%,#06142e_35%,#02060f_100%)]">
        {/* the sun's light on the water */}
        <div className="hero-loader__glint absolute left-1/2 top-0 h-[40%] w-[min(14vw,6rem)] -translate-x-1/2 bg-[linear-gradient(180deg,rgb(255_210_122/0.5),transparent)] blur-md" />
        <p className="hero-loader__caption absolute inset-x-0 top-[22%] text-center text-[0.8rem] font-bold uppercase tracking-[0.32em] text-white/55">
          First light over Lebanon
        </p>
      </div>
      {/* the horizon, drawn across as the scene comes together */}
      <div className="hero-loader__line absolute inset-x-[8%] top-[58%] h-px -translate-y-1/2 origin-left bg-[linear-gradient(90deg,transparent,#ffd27a_20%,#fff3cf_50%,#ffd27a_80%,transparent)]" />
    </div>
  );
}
