import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import Arrow from "../components/Arrow";
import { headingProps } from "../components/worldType";
import { hasGen } from "../lib/media";
import { PLATFORMS } from "../content/platforms";
import { MEMBER_URL } from "../content/site";

// The platforms page on a phone: its own page rather than the desktop one squeezed. The worlds
// become cards you swipe through, each in its platform's colours and type, with an index of all of
// them to jump to. Plain scrolling and CSS snapping, no moving sets and no WebGL, so it stays
// light on a phone.

function OpenIt({ p }) {
  if (!p.url) return null;
  const cls = "inline-flex h-12 items-center gap-3 rounded-full bg-[var(--w-ink)] px-6 font-bold text-[var(--w-bg)]";
  return p.url.startsWith("http") ? (
    <a href={p.url} target="_blank" rel="noreferrer" className={cls}>
      {p.cta || `Open ${p.name}`}
      <Arrow />
    </a>
  ) : (
    <Link to={p.url} viewTransition className={cls}>
      {p.cta || `Open ${p.name}`}
      <Arrow />
    </Link>
  );
}

function Card({ p, i, total }) {
  const w = p.world;
  const h = headingProps(w);
  return (
    <article
      id={`m-${p.id}`}
      aria-label={`${p.name}, ${i + 1} of ${total}`}
      className="relative flex w-[86vw] shrink-0 snap-center flex-col overflow-clip rounded-[1.8rem] shadow-[0_24px_60px_rgb(0_0_0/0.35)]"
      style={{
        "--w-bg": w.bg,
        "--w-ink": w.ink,
        "--w-soft": w.soft,
        "--w-accent": w.accent,
        "--w-accent-ink": w.accentInk,
        "--w-line": w.line,
        background: `radial-gradient(90% 60% at 80% 0%, color-mix(in oklab, ${w.accent} 22%, transparent), transparent 70%), ${w.bg}`,
        color: w.ink,
      }}
    >
      <div className="p-3 pb-0">
        <Media
          name={hasGen(p.image) ? p.image : p.screen}
          alt={`${p.name} on a laptop and a phone`}
          tone={p.tone}
          seed={600 + i * 7}
          sizes="86vw"
          className="aspect-[16/10] rounded-[1.3rem]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 pt-5">
        <p className="font-bold text-[var(--w-accent-ink)]">{p.kind}</p>
        <h3 className={`mt-2 ${h.className}`} style={{ ...h.style, fontSize: "clamp(2.2rem, 10vw, 3rem)" }}>
          {p.name}
        </h3>
        <p className="mt-3 text-[1.05rem] leading-relaxed">{p.line}</p>
        <ul className="mt-5 space-y-2.5">
          {p.points.map((pt) => (
            <li key={pt} className="flex gap-3 border-t border-[var(--w-line)] pt-2.5 text-[0.98rem]">
              <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-[var(--w-accent)]" />
              {pt}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <OpenIt p={p} />
        </div>
      </div>
    </article>
  );
}

export default function PlatformsMobile() {
  const track = useRef(null);
  const [at, setAt] = useState(0);
  const total = PLATFORMS.length;
  const first = PLATFORMS[0];

  // which card is in the middle of the track
  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const onScroll = () => {
      const cards = [...el.children];
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setAt(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i) => {
    const el = track.current;
    const card = el && el.children[i];
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <section className="relative isolate overflow-clip bg-night pb-14 pt-28 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[58%] -z-10 aspect-square w-[220vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#0a2a66_0%,#06215a_88%,#0b63d6_96.5%,#ffd27a_99.2%,#fff3cf_100%)] shadow-[0_-18px_70px_rgb(255_200_69/0.5)]"
        />
        <div className="shell">
          <Reveal className="is-in">
            <h1 id="page-title" tabIndex={-1} className="display text-[clamp(2.8rem,12vw,4rem)] outline-none">
              <Lines text={["What we build", "after class."]} />
            </h1>
            <p className="fade mt-4 text-[1.08rem] text-white/80" style={{ "--i": 2 }}>
              AIESEC in Lebanon is run by volunteers, and some of them write software. Swipe through what they have built.
            </p>
          </Reveal>
          <div className="mt-10 overflow-clip rounded-[1.2rem] border border-white/14 shadow-[0_30px_70px_rgb(0_0_0/0.5)]">
            <Media name={first.screen} alt={`${first.name}, one of its screens`} tone="day" seed={590} sizes="92vw" className="aspect-[16/10]" imgClassName="object-top" priority />
          </div>
        </div>
      </section>

      <section aria-label="The platforms" className="bg-[linear-gradient(180deg,#030b1c,#06142e)] pb-16 pt-10 text-white">
        <div className="shell flex items-end justify-between">
          <h2 className="display text-[2rem]">Swipe through the platforms</h2>
          <p aria-live="polite" className="font-bold text-white/70">
            {at + 1} / {total}
          </p>
        </div>
        <div
          ref={track}
          className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[7vw] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PLATFORMS.map((p, i) => (
            <Card key={p.id} p={p} i={i} total={total} />
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {PLATFORMS.map((p, i) => (
            <span key={p.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === at ? "w-6 bg-sun" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>

        {/* every platform, to jump to */}
        <div className="shell mt-12">
          <h2 className="font-bold uppercase tracking-[0.2em] text-white/55 text-[0.8rem]">All of them</h2>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {PLATFORMS.map((p, i) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(i)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                  <span>
                    <span className="block text-[1.15rem] font-bold">{p.name}</span>
                    <span className="block text-[0.92rem] text-white/60">{p.kind}</span>
                  </span>
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.world.accent }} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="blue-field py-20 text-white">
        <div className="shell">
          <h2 className="display text-[clamp(2.6rem,11vw,3.6rem)]">You could be the one who builds the next.</h2>
          <p className="mt-5 text-[1.08rem] text-white/90">
            The people behind these are students: developers, designers and people who just like making things work. If that
            is you, there is room.
          </p>
          <a href={MEMBER_URL} className="mt-8 inline-flex h-14 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink">
            Become a member
          </a>
        </div>
      </section>
    </>
  );
}
