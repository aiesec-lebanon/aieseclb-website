import { Link } from "react-router-dom";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import Arrow from "../components/Arrow";
import SampleNote from "../components/SampleNote";
import { PLATFORMS } from "../content/platforms";
import { SIGNUP_URL } from "../content/site";

// A browser window drawn in CSS, holding a screenshot (or a code-made stand-in until one is added).
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
          {platform.url && platform.url.startsWith("http") ? platform.url.replace("https://", "") : "aieseclb.org"}
        </span>
      </div>
      <Media
        name={platform.image}
        alt={`Screenshot of ${platform.name}`}
        tone={platform.tone}
        seed={seed}
        priority={priority}
        className="aspect-[16/10]"
      />
    </div>
  );
}

export default function Platforms() {
  const [first, second, third] = PLATFORMS;
  return (
    <>
      {/* Hero: screens rising out of first light */}
      <section className="relative isolate overflow-clip bg-night text-white">
        <div className="shell relative z-10 pt-36 text-center md:pt-44">
          <Reveal className="is-in">
            <h1 id="page-title" tabIndex={-1} className="display text-mega mx-auto max-w-[12ch] outline-none">
              <Lines text={["What we build", "after class."]} />
            </h1>
            <p className="fade text-lead mx-auto mt-6 max-w-[36rem] text-white/80" style={{ "--i": 3 }}>
              AIESEC in Lebanon is run by volunteers. Its information management team writes the software that lets
              it run like something much bigger.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16 md:mt-24">
          {/* the horizon: an arc of light the screens come up over */}
          <div
            aria-hidden="true"
            className="arc-rise pointer-events-none absolute left-1/2 top-[18%] -z-10 aspect-square w-[150vw] -translate-x-1/2 rounded-full border-t-[3px] border-sun/90 bg-[radial-gradient(ellipse_60%_26%_at_50%_0%,rgb(255_200_69/0.34),rgb(3_126_243/0.20)_45%,transparent_72%)] md:w-[118vw]"
          />
          <div className="shell relative grid grid-cols-12 items-end gap-3 pb-0 md:gap-6">
            <div className="parallax col-span-3 hidden translate-y-10 md:block" style={{ "--py": "3.2rem" }}>
              <Screen platform={second} seed={501} className="origin-bottom-right -rotate-3" />
            </div>
            <div className="screen-rise col-span-12 md:col-span-6">
              <Screen platform={first} seed={500} priority />
            </div>
            <div className="parallax col-span-3 hidden translate-y-10 md:block" style={{ "--py": "4.4rem" }}>
              <Screen platform={third || second} seed={502} className="origin-bottom-left rotate-3" />
            </div>
          </div>
          <div aria-hidden="true" className="h-16 bg-[linear-gradient(180deg,transparent,var(--color-night))] md:h-28" />
        </div>
      </section>

      <div className="bg-night">
        <SampleNote file="src/content/platforms.js" />
      </div>

      {PLATFORMS.map((p, i) => (
        <section key={p.id} id={p.id} className={i % 2 ? "bg-night-800 text-white" : "bg-night text-white"}>
          <div className="shell grid gap-10 py-20 md:grid-cols-12 md:items-center md:gap-12 md:py-32">
            <Reveal className={`md:col-span-5 ${i % 2 ? "md:order-2" : ""}`}>
              <p className="fade font-bold text-sun">{p.kind}</p>
              <h2 className="display mt-3 text-[clamp(2.6rem,5.6vw,5.6rem)]">
                <Lines text={[p.name]} />
              </h2>
              <p className="fade text-lead mt-6 text-white/85" style={{ "--i": 2 }}>
                {p.line}
              </p>
              <ul className="fade mt-8 space-y-3" style={{ "--i": 3 }}>
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3 border-t border-white/14 pt-3 text-white/85">
                    <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-aiesec" />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="fade mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 4 }}>
                {p.stack.map((s) => (
                  <span key={s} className="rounded-full border border-white/22 px-4 py-1.5 text-[0.92rem] font-bold text-white/80">
                    {s}
                  </span>
                ))}
                {p.url &&
                  (p.url.startsWith("http") ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group ml-auto inline-flex h-12 items-center gap-3 rounded-full bg-white px-6 font-bold text-ink transition-colors hover:bg-sun"
                    >
                      Open it
                      <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
                    </a>
                  ) : (
                    <Link
                      to={p.url}
                      viewTransition
                      className="group ml-auto inline-flex h-12 items-center gap-3 rounded-full bg-white px-6 font-bold text-ink transition-colors hover:bg-sun"
                    >
                      Open it
                      <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
                    </Link>
                  ))}
              </div>
            </Reveal>
            <div className="md:col-span-7">
              <div className="tilt-in [perspective:1600px]">
                <Screen platform={p} seed={520 + i * 7} />
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-aiesec py-24 text-white md:py-36">
        <div className="shell grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
          <Reveal>
            <h2 className="display text-mega max-w-[13ch]">
              <Lines text={["You could be", "the one who", "builds the next."]} />
            </h2>
          </Reveal>
          <Reveal>
            <p className="fade text-lead text-white/90">
              The team is students: developers, designers and people who just like making things work. If that is
              you, there is room.
            </p>
            <a
              href={SIGNUP_URL}
              className="fade mt-8 inline-flex h-14 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
              style={{ "--i": 2 }}
            >
              Join the team
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
