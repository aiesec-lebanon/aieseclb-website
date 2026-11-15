import { useState } from "react";
import { PARTNERS } from "../content/site";

const logos = import.meta.glob("../assets/images/*_logo.png", { eager: true, query: "?url", import: "default" });
const logoUrl = (file) => logos[`../assets/images/${file}`];

// Partner logos drifting past. It moves on its own for longer than five seconds, so it comes
// with a real pause button, and it also rests on hover and keyboard focus.
export default function LogoMarquee({ className = "" }) {
  const [paused, setPaused] = useState(false);
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center gap-5 pr-5" aria-hidden={hidden || undefined}>
      {PARTNERS.map((p) => (
        <li
          key={p.name}
          className="grid h-28 w-56 shrink-0 place-items-center rounded-[1.4rem] border border-ink/8 bg-sky px-8 md:h-32 md:w-64"
        >
          <img
            src={logoUrl(p.logo)}
            alt={hidden ? "" : p.name}
            loading="lazy"
            className="max-h-[52%] w-auto max-w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={className}>
      <div
        className="marquee overflow-clip [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        data-paused={paused}
      >
        <div className="marquee-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <div className="shell mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="rounded-full border border-ink/20 px-5 py-2 text-[0.95rem] font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink motion-reduce:hidden"
        >
          {paused ? "Play logos" : "Pause logos"}
        </button>
      </div>
    </div>
  );
}
