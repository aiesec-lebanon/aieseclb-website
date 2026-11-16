import { Link } from "react-router-dom";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import MockScreen from "../components/MockScreen";
import Arrow from "../components/Arrow";
import World, { Frame, SceneryToggle } from "../components/World";
import { headingProps } from "../components/worldType";
import { hasGen } from "../lib/media";
import { PLATFORMS } from "../content/platforms";
import { MEMBER_URL } from "../content/site";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/shantell-sans/700.css";
import "@fontsource/shantell-sans/800.css";
import "@fontsource-variable/figtree";
import "@fontsource-variable/jetbrains-mono";

const NIGHT = "#030b1c";

// A browser window drawn in CSS around one screen of a platform (or a drawn stand-in until the
// picture is there).
function Screen({ platform, seed, className = "", priority = false }) {
  return (
    <div
      className={`overflow-clip rounded-[1.1rem] border border-white/14 bg-night-800 shadow-[0_40px_120px_rgb(0_0_0/0.5)] md:rounded-[1.5rem] ${className}`}
    >
      <div className="flex h-9 items-center gap-2 border-b border-white/10 bg-night-700/80 px-4 md:h-11">
        <span className="h-2.5 w-2.5 rounded-full bg-white/22" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/22" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/22" />
        <span className="ml-3 truncate rounded-full bg-white/8 px-4 py-1 text-[0.78rem] font-bold text-white/60">
          {platform.url && platform.url.startsWith("https://signup") ? "signup.aieseclb.org" : platform.name}
        </span>
      </div>
      {hasGen(platform.screen) ? (
        <Media
          name={platform.screen}
          alt={`${platform.name}, one of its screens`}
          tone={platform.tone}
          seed={seed}
          priority={priority}
          className="aspect-[16/10]"
          imgClassName="object-top"
        />
      ) : (
        <div className="relative aspect-[16/10]">
          <MockScreen kind={platform.mock} seed={seed} label={`Illustration of the ${platform.name} interface`} />
        </div>
      )}
    </div>
  );
}

function OpenIt({ platform }) {
  const cls =
    "group inline-flex h-12 items-center gap-3 rounded-full bg-[var(--w-ink)] px-6 font-bold text-[var(--w-bg)] transition-[gap] duration-300 hover:gap-4";
  const label = platform.cta || `Open ${platform.name}`;
  if (!platform.url) return null;
  return platform.url.startsWith("http") ? (
    <a href={platform.url} target="_blank" rel="noreferrer" className={cls}>
      {label}
      <Arrow />
    </a>
  ) : (
    <Link to={platform.url} viewTransition className={cls}>
      {label}
      <Arrow />
    </Link>
  );
}

// a glass card for the words, where a world's scenery runs behind them (and the overlap layout)
const GLASS = "md:rounded-[1.6rem] md:border md:border-[var(--w-line)] md:bg-[color-mix(in_oklab,var(--w-card)_88%,transparent)] md:p-10 md:shadow-[0_30px_80px_rgb(0_0_0/0.45)] md:backdrop-blur-md";

// The pieces a platform's world is laid out from (in each world's own type and colours).
function Head({ p, compact = false }) {
  const h = headingProps(p.world);
  // inside a card the heading is a size smaller, so long names stay whole
  const style = compact ? { ...h.style, fontSize: "clamp(2.3rem, 3.9vw, 4.1rem)" } : h.style;
  return (
    <>
      <p className="fade font-bold text-[var(--w-accent-ink)]">{p.kind}</p>
      <h2 className={`mt-3 ${h.className}`} style={style}>
        <Lines text={[p.name]} />
      </h2>
    </>
  );
}
function Lead({ p, className = "" }) {
  return (
    <p className={`fade text-lead mt-6 ${className}`} style={{ "--i": 2 }}>
      {p.line}
    </p>
  );
}
function Points({ p }) {
  return (
    <ul className="fade mt-8 space-y-3" style={{ "--i": 3 }}>
      {p.points.map((pt) => (
        <li key={pt} className="flex gap-3 border-t border-[var(--w-line)] pt-3">
          <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-[var(--w-accent)]" />
          {pt}
        </li>
      ))}
    </ul>
  );
}
function Stack({ p }) {
  return (
    <div className="fade mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ "--i": 4 }}>
      {/* a line, not pills: pills look like buttons, and these are only what it is made with */}
      <p className="text-[0.95rem] text-[var(--w-soft)]">
        Built with <span className="font-bold">{p.stack.join(", ")}</span>
      </p>
      <span className="ml-auto">
        <OpenIt platform={p} />
      </span>
    </div>
  );
}
function Picture({ p, i, sizes }) {
  return (
    <Reveal>
      <div className="rise-in">
      {hasGen(p.image) ? (
        <Frame world={p.world}>
          <Media name={p.image} alt={`${p.name} on a laptop and a phone`} tone={p.tone} seed={520 + i * 7} sizes={sizes} className="aspect-[16/10]" />
        </Frame>
      ) : (
        <Screen platform={p} seed={520 + i * 7} />
      )}
      </div>
    </Reveal>
  );
}

export default function PlatformsDesktop() {
  const [first, second, third] = PLATFORMS;
  const last = PLATFORMS[PLATFORMS.length - 1].world;
  return (
    <>
      {/* Hero: screens of the platforms rising out of first light */}
      <section className="relative isolate overflow-clip bg-night text-white">
        <div className="shell relative z-10 pt-32 text-center md:pt-36">
          <Reveal className="is-in">
            <h1 id="page-title" tabIndex={-1} className="display text-title mx-auto max-w-[13ch] outline-none md:text-[clamp(3rem,5.8vw,6rem)]">
              <Lines text={["What we build", "after class."]} />
            </h1>
            <p className="fade text-lead mx-auto mt-5 max-w-[36rem] text-white/80" style={{ "--i": 3 }}>
              AIESEC in Lebanon is run by volunteers, and some of them write software. Each of these is a world of its
              own: scroll down and walk through them.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-10 md:mt-14">
          {/* the horizon: the edge of a sun the screens come up over */}
          <div
            aria-hidden="true"
            className="arc-rise pointer-events-none absolute left-1/2 top-[9%] -z-10 aspect-square w-[170vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#0a2a66_0%,#06215a_88%,#0b63d6_96.5%,#ffd27a_99.2%,#fff3cf_100%)] shadow-[0_-18px_70px_rgb(255_200_69/0.55),0_-60px_180px_rgb(3_126_243/0.55)] md:w-[124vw]"
          />
          <div className="shell relative grid max-w-[66rem] grid-cols-12 items-end gap-3 pb-0 md:gap-5">
            <div className="parallax col-span-3 hidden translate-y-6 md:block" style={{ "--py": "3.2rem" }}>
              <Screen platform={second} seed={501} className="origin-bottom-right -rotate-3" />
            </div>
            <div className="screen-rise col-span-12 md:col-span-6">
              <Screen platform={first} seed={500} priority />
            </div>
            <div className="parallax col-span-3 hidden translate-y-6 md:block" style={{ "--py": "4.4rem" }}>
              <Screen platform={third} seed={502} className="origin-bottom-left rotate-3" />
            </div>
          </div>
          <div aria-hidden="true" className="h-16 bg-[linear-gradient(180deg,transparent,var(--color-night))] md:h-28" />
        </div>
      </section>

      {/* One world per platform, made from its own design (components/World.jsx; each world is
          in content/platforms.js) */}
      <div className="relative">
        {PLATFORMS.map((p, i) => {
          const w = p.world;
          const layout = p.layout || "split";
          const side = layout === "split" ? (i % 2 ? "right" : "left") : "left";
          return (
            <World
              key={p.id}
              id={p.id}
              world={w}
              textSide={side}
              from={i ? PLATFORMS[i - 1].world.bg : NIGHT}
              label={p.name}
              className="flex min-h-[150svh] items-center"
            >
              {layout === "overlap" ? (
                // a large picture with the words on a card laid over its corner
                <div className="shell grid items-center py-[30svh] md:grid-cols-12">
                  <div className="max-md:order-first md:col-span-8 md:col-start-5 md:row-start-1">
                    <Picture p={p} i={i} sizes="(max-width: 768px) 92vw, 66vw" />
                  </div>
                  <Reveal className={`relative z-10 mt-10 md:col-span-5 md:col-start-1 md:row-start-1 md:mt-0 ${GLASS}`}>
                    <Head p={p} compact />
                    <Lead p={p} />
                    <Points p={p} />
                    <Stack p={p} />
                  </Reveal>
                </div>
              ) : (
                // side by side, alternating
                <div className="shell grid items-center gap-10 py-[34svh] md:grid-cols-12 md:gap-14">
                  <Reveal
                    className={`relative z-10 ${p.card ? "md:col-span-5" : "md:col-span-4"} ${i % 2 ? "md:order-2" : ""} ${p.card ? GLASS : i % 2 ? "md:pl-2" : "md:pr-2"}`}
                  >
                    <Head p={p} compact={p.card} />
                    <Lead p={p} />
                    <Points p={p} />
                    <Stack p={p} />
                  </Reveal>
                  <div className={`max-md:order-first ${p.card ? "md:col-span-7" : "md:col-span-8"}`}>
                    <Picture p={p} i={i} sizes="(max-width: 768px) 92vw, 58vw" />
                  </div>
                </div>
              )}
            </World>
          );
        })}
        <SceneryToggle />
      </div>

      <section className="blue-field text-white">
        <div aria-hidden="true" className="h-[22svh]" style={{ background: `linear-gradient(${last.bg}, var(--color-aiesec-deep))` }} />
        <div className="shell grid gap-10 pb-24 pt-4 md:grid-cols-[1.3fr_1fr] md:items-end md:pb-36">
          <Reveal>
            <h2 className="display text-mega max-w-[13ch]">
              <Lines text={["You could be", "the one who", "builds the next."]} />
            </h2>
          </Reveal>
          <Reveal>
            <p className="fade text-lead text-white/90">
              The people behind these are students: developers, designers and people who just like making things
              work. If that is you, there is room.
            </p>
            <a
              href={MEMBER_URL}
              className="fade mt-8 inline-flex h-14 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
              style={{ "--i": 2 }}
            >
              Become a member
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
