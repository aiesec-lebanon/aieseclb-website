import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import DawnHero from "../scenes/DawnHero";
import DawnHeroReal from "../scenes/DawnHeroReal";
import { clearFallback, readStored } from "../gl/quality";
import Reveal, { Lines } from "../components/Reveal";
import LebanonMap from "../components/LebanonMap";
import { STORIES, storyPhoto } from "../content/stories";
import "@fontsource/instrument-serif/400-italic.css";
import Counter from "../components/Counter";
import Media from "../components/Scenic";
import LogoMarquee from "../components/LogoMarquee";
import Arrow from "../components/Arrow";
import LazyMount from "../components/LazyMount";
import { PROGRAMS, SIGNUP_URL, STATS, UNIVERSITIES } from "../content/site";

const GlobeChapter = lazy(() => import("../scenes/GlobeChapter"));

const logos = import.meta.glob("../assets/images/*_logo.png", { eager: true, query: "?url", import: "default" });
const logoUrl = (file) => logos[`../assets/images/${file}`];

// The manifesto, with its key phrases marked (true): they fill to AIESEC blue over a band of sun,
// like a highlighter, as the rest fills to ink.
const MANIFEST = [
  ["AIESEC is a global organisation run entirely", false],
  ["by youth, for youth.", true],
  ["Since 1948", true],
  ["it has helped young people find", false],
  ["the leader in themselves", true],
  ["through", false],
  ["real experiences abroad.", true],
  ["In Lebanon, that work has had a home in", false],
  ["Beirut since 2011.", true],
];
const MANIFEST_WORDS = MANIFEST.flatMap(([text, hl]) => {
  const ws = text.split(" ");
  return ws.map((w, i) => ({ w, hl, end: i === ws.length - 1 }));
});

function Manifest() {
  const words = MANIFEST_WORDS;
  return (
    <section data-shot="manifest" data-scheme="light" className="dawn-light bg-sky pb-24 pt-28 md:pb-36 md:pt-44">
      <div className="shell">
        <p className="display ink-fill max-w-[30ch] text-[clamp(2.2rem,6.1vw,6.2rem)] leading-[0.98] text-ink">
          {words.map(({ w, hl, end }, i) => (
            <span key={i} style={{ "--i": i, "--step": `${46 / words.length}%` }}>
              {hl ? (
                <>
                  <mark className="manifest-hl">{end ? w : `${w} `}</mark>
                  {end ? " " : ""}
                </>
              ) : (
                `${w} `
              )}
            </span>
          ))}
        </p>

        <Reveal className="mt-20 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-ink/14 pt-10 md:mt-28 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="fade" style={{ "--i": i }}>
              <div className="display text-[clamp(2.4rem,5.2vw,5rem)] text-aiesec">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 max-w-[12rem] text-[1.05rem] font-bold text-ink-soft">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Doors() {
  const doors = [
    {
      who: "I live in Lebanon",
      line: ["Go out into", "the world."],
      body: "Volunteer, intern or teach in another country, and come home with more than you left with. Or stay, join a team, and send others.",
      cta: "Find your experience",
      to: "/exchange",
      image: "door-local",
      alt: "Young people from Lebanon setting out on an exchange",
      tone: "night",
      seed: 3,
    },
    {
      who: "I am coming to Lebanon",
      line: ["Let Lebanon", "take you in."],
      body: "Mountains you can see from the sea, cities older than writing, and people who will feed you before they ask your name.",
      cta: "See what is waiting",
      to: "/lebanon",
      image: "door-incoming",
      alt: "A visitor looking out over the Lebanese coast",
      tone: "day",
      seed: 8,
    },
  ];
  return (
    <section data-shot="doors" data-scheme="light" className="dawn-light bg-sky pb-28 pt-24 md:pb-40 md:pt-36">
      <div className="shell">
        <Reveal>
          <h2 className="display text-mega text-ink">
            <Lines text={["Two ways in."]} />
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          {doors.map((d, i) => (
            <Reveal key={d.who} delay={i * 120}>
              <Link
                to={d.to}
                viewTransition
                className="fade group relative block overflow-clip rounded-[2rem] bg-night text-white md:rounded-[2.6rem]"
              >
                <Media
                  name={d.image}
                  alt={d.alt}
                  tone={d.tone}
                  seed={d.seed}
                  className="aspect-[4/5] md:aspect-[5/6]"
                  imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_11_28/0.05)_30%,rgb(3_11_28/0.82)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-11">
                  <p className="text-[1.05rem] font-bold text-sun">{d.who}</p>
                  <h3 className="display mt-3 text-[clamp(2.4rem,4.6vw,4.6rem)]">
                    {d.line.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </h3>
                  <p className="mt-5 max-w-[26rem] text-white/82">{d.body}</p>
                  <span className="mt-7 inline-flex items-center gap-3 text-[1.08rem] font-bold">
                    {d.cta}
                    <Arrow className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LebanonTeaser() {
  const facts = [
    { n: "10,452", unit: "km²", label: "of country, about a third the size of Belgium" },
    { n: "225", unit: "km", label: "of Mediterranean coast" },
    { n: "3,088", unit: "m", label: "at Qurnat as Sawda, the highest point in the Levant" },
  ];
  return (
    <section data-shot="lebanon" className="relative overflow-clip bg-night py-28 text-white md:py-44">
      <div className="shell">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <h2 className="display text-mega max-w-[15ch]">
              <Lines text={["Small enough to cross", "in a morning.", "Deep enough for a lifetime."]} />
            </h2>
          </Reveal>
          {/* the country itself: small enough to see whole */}
          <LebanonMap className="mx-auto h-[26rem] w-full max-w-[24rem] md:col-span-5 md:h-[40rem] md:max-w-none" />
        </div>

        <div className="mt-16 grid gap-5 md:mt-24 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5 md:pt-24">
            <div className="overflow-clip rounded-[1.6rem]">
              <Media
                name="lebanon-cedars"
                alt="Ancient cedars in the snow above Bsharri"
                tone="cedar"
                seed={11}
                className="unveil aspect-[4/5]"
                imgClassName="zoom-out"
              />
            </div>
            <p className="mt-4 text-white/70">The Cedars of God, Bsharri</p>
          </div>
          <div className="md:col-span-7">
            <div className="overflow-clip rounded-[1.6rem]">
              <Media
                name="lebanon-byblos"
                alt="The old harbour of Byblos at golden hour"
                tone="dawn"
                seed={5}
                className="unveil aspect-[16/11]"
                imgClassName="zoom-out"
              />
            </div>
            <p className="mt-4 text-white/70">Byblos, lived in for some seven thousand years</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 md:gap-6">
              <div className="parallax" style={{ "--py": "2.2rem" }}>
                <div className="overflow-clip rounded-[1.6rem]">
                  <Media name="lebanon-baalbek" alt="The Roman temples of Baalbek" tone="tangerine" seed={21} className="aspect-square" />
                </div>
                <p className="mt-4 text-white/70">Baalbek</p>
              </div>
              <div className="parallax" style={{ "--py": "-1.6rem" }}>
                <div className="overflow-clip rounded-[1.6rem]">
                  <Media name="lebanon-raouche" alt="The Pigeon Rocks of Raouché, Beirut" tone="night" seed={30} className="aspect-square" />
                </div>
                <p className="mt-4 text-white/70">Raouché, Beirut</p>
              </div>
            </div>
          </div>
        </div>

        <Reveal className="mt-20 grid gap-10 border-t border-white/14 pt-10 md:mt-28 md:grid-cols-[repeat(3,1fr)_auto] md:items-end">
          {facts.map((f, i) => (
            <div key={f.n} className="fade" style={{ "--i": i }}>
              <div className="display text-[clamp(2.6rem,5vw,4.8rem)]">
                {f.n}
                <span className="ml-1.5 text-[0.42em] text-sun">{f.unit}</span>
              </div>
              <div className="mt-2 max-w-[15rem] text-white/72">{f.label}</div>
            </div>
          ))}
          <Link
            to="/lebanon"
            viewTransition
            className="fade group inline-flex h-14 items-center gap-3 rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
            style={{ "--i": 3 }}
          >
            Discover Lebanon
            <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const PROGRAM_BG = { ember: "bg-ember", teal: "bg-teal", tangerine: "bg-tangerine" };

function Programs() {
  return (
    <section data-shot="programs" data-scheme="light" className="dawn-light bg-sky py-28 md:py-44">
      <div className="shell">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display text-mega text-ink">
            <Lines text={["Three ways to go."]} />
          </h2>
          <p className="fade text-lead max-w-[27rem] text-ink-soft" style={{ "--i": 2 }}>
            Every AIESEC exchange is a real job to do, in a place you have never lived, with people you have not met yet.
          </p>
        </Reveal>

        <div className="mt-14 md:mt-20">
          {PROGRAMS.map((p, i) => (
            <article
              key={p.id}
              className={`sticky mb-6 grid overflow-clip rounded-[2rem] text-ink shadow-[0_-18px_50px_rgb(11_27_51/0.16)] md:grid-cols-2 md:rounded-[2.6rem] ${PROGRAM_BG[p.color]}`}
              style={{ top: `calc(5.5rem + ${i * 1.4}rem)` }}
            >
              <div className="flex flex-col justify-between gap-12 p-8 md:p-14">
                <p className="text-[1.05rem] font-bold">{p.name}</p>
                <div>
                  <h3 className="display text-[clamp(3.6rem,8.8vw,9rem)]">{p.verb}.</h3>
                  <p className="display-wide mt-5 text-[clamp(1.25rem,2vw,1.75rem)]">{p.line}</p>
                  <p className="mt-4 max-w-[30rem]">{p.body}</p>
                  <Link
                    to={`/exchange#${p.id}`}
                    viewTransition
                    className="group mt-8 inline-flex h-13 items-center gap-3 rounded-full bg-ink px-7 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-ink"
                  >
                    How it works
                    <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </div>
              <Media
                name={p.image}
                alt={`${p.name}: young people on exchange`}
                tone={p.color}
                seed={40 + i * 7}
                className="min-h-[18rem] md:min-h-[34rem]"
              />
            </article>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-col items-start gap-5 rounded-[2rem] blue-field p-8 text-white md:flex-row md:items-center md:justify-between md:rounded-[2.6rem] md:p-14">
          <div>
            <p className="fade text-[1.05rem] font-bold text-white/90">Membership</p>
            <h3 className="display fade mt-3 text-[clamp(2.2rem,4.4vw,4.2rem)]" style={{ "--i": 1 }}>
              Or stay, and lead the people who go.
            </h3>
          </div>
          <a
            href={SIGNUP_URL}
            className="fade inline-flex h-14 shrink-0 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
            style={{ "--i": 2 }}
          >
            Join AIESEC in Lebanon
          </a>
        </Reveal>
      </div>
    </section>
  );
}

// Back with stories: three people who have been, and a way to the rest
function StoriesTeaser() {
  return (
    <section data-shot="stories" className="bg-night py-28 text-white md:py-40">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display text-mega max-w-[12ch]">
              <Lines text={["Back with", "stories."]} />
            </h2>
          </Reveal>
          <Reveal>
            <Link
              to="/stories"
              viewTransition
              className="fade group inline-flex h-14 items-center gap-3 rounded-full border border-white/35 px-7 text-lg font-bold transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              Every story
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-6">
          {STORIES.slice(0, 3).map((s, i) => (
            <Reveal key={s.id}>
              <Link to={`/stories#${s.id}`} className="fade group block" style={{ "--i": i }}>
                <div className="overflow-clip rounded-[1.6rem]">
                  <Media
                    name={storyPhoto(s, 0)}
                    alt={`${s.name}, on exchange in ${s.to.city}`}
                    tone="dawn"
                    seed={790 + i}
                    sizes="(max-width: 768px) 92vw, 30vw"
                    className="aspect-[4/5]"
                    imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-5 font-bold text-sun">
                  {s.from.city} <span aria-hidden="true">→</span>
                  <span className="sr-only">to</span> {s.to.city}
                </p>
                <p className="mt-2 text-[1.45rem] italic leading-snug" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
                  “{s.quote}”
                </p>
                <p className="mt-3 font-bold text-white/70">{s.name}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcases() {
  const items = [
    {
      to: "/events",
      title: ["What we", "gather for."],
      body: "Conferences, forums and cultural nights: the moments the year is built around.",
      cta: "See the events",
      image: "events-cover",
      alt: "Delegates at an AIESEC in Lebanon conference",
      tone: "ember",
      seed: 61,
    },
    {
      to: "/platforms",
      title: ["What we", "build."],
      body: "The tools our information management team has made so that a volunteer organisation can run like a serious one.",
      cta: "See the platforms",
      image: "platforms-cover",
      alt: "Screens of platforms built by AIESEC in Lebanon",
      tone: "night",
      seed: 77,
    },
  ];
  return (
    <section data-shot="showcases" className="blue-field py-28 text-white md:py-40">
      <div className="shell grid gap-5 md:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.to} delay={i * 120}>
            <Link to={it.to} viewTransition className="fade group block">
              <div className="overflow-clip rounded-[2rem] md:rounded-[2.6rem]">
                <Media
                  name={it.image}
                  alt={it.alt}
                  tone={it.tone}
                  seed={it.seed}
                  className="aspect-[16/11]"
                  imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
              </div>
              <h2 className="display mt-8 text-[clamp(2.6rem,5.4vw,5.4rem)]">
                {it.title.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
              <p className="mt-5 max-w-[28rem] text-white/88">{it.body}</p>
              <span className="mt-6 inline-flex items-center gap-3 text-[1.08rem] font-bold">
                {it.cta}
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Company() {
  return (
    <section data-shot="company" data-scheme="light" className="bg-white py-28 md:py-40">
      <div className="shell">
        <Reveal className="grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="display text-mega text-ink">
            <Lines text={["In good", "company."]} />
          </h2>
          <p className="fade text-lead max-w-[30rem] text-ink-soft md:justify-self-end" style={{ "--i": 2 }}>
            We work out of two universities in Beirut, and with companies around the world that open their doors to
            young people.
          </p>
        </Reveal>

        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-20">
          {UNIVERSITIES.map((u, i) => (
            <div
              key={u.short}
              className={`fade grid h-48 place-items-center rounded-[2rem] p-8 md:h-64 ${u.dark ? "bg-[#6b1b47]" : "bg-sky"}`}
              style={{ "--i": i }}
            >
              <img src={logoUrl(u.logo)} alt={u.name} loading="lazy" className="max-h-full w-auto max-w-[78%] object-contain" />
            </div>
          ))}
        </Reveal>
      </div>
      <LogoMarquee className="mt-16 md:mt-24" />
    </section>
  );
}

// Two versions of the opening scene live side by side on this branch. The realistic one is the
// default; a device that cannot run it smoothly gets the drawn one instead, and is remembered.
// ?hero=graphic or ?hero=real in the address picks one by hand.
function initialHero() {
  const asked = new URLSearchParams(window.location.search).get("hero");
  if (asked === "real") {
    clearFallback();
    return { kind: "real", why: null };
  }
  if (asked === "graphic") return { kind: "graphic", why: null };
  const stored = readStored();
  return stored && stored.fallback ? { kind: "graphic", why: "remembered" } : { kind: "real", why: null };
}

function Hero() {
  const [state, setState] = useState(initialHero);
  return (
    <>
      {state.kind === "graphic" ? (
        <DawnHero />
      ) : (
        <DawnHeroReal onTooSlow={(reason) => setState({ kind: "graphic", why: reason })} />
      )}
      {/* while developing: switch between the two heroes in place (and the address keeps the choice) */}
      {import.meta.env.DEV && (
        <div role="group" aria-label="Hero, development only" className="fixed bottom-3 left-3 z-[80] flex items-center gap-1 rounded-full bg-black/80 p-1 text-[13px] font-bold text-white backdrop-blur">
          <span className="px-2 text-white/60">Hero</span>
          {[
            ["real", "Realistic"],
            ["graphic", "Drawn"],
          ].map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              aria-pressed={state.kind === kind}
              onClick={() => {
                if (kind === "real") clearFallback();
                const url = new URL(window.location.href);
                url.searchParams.set("hero", kind);
                window.history.replaceState(window.history.state, "", url);
                setState({ kind, why: null });
              }}
              className={`rounded-full px-3 py-1.5 transition-colors ${state.kind === kind ? "bg-sun text-ink" : "hover:bg-white/15"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {/* while developing, say out loud when and why the drawn hero stands in */}
      {import.meta.env.DEV && state.why && (
        <p className="fixed bottom-16 left-3 z-[80] max-w-[26rem] rounded-xl bg-black/80 px-4 py-3 text-[13px] font-bold text-white">
          Showing the drawn hero: this browser was judged too slow for the realistic one (
          {state.why === "remembered" ? "remembered from an earlier visit" : state.why}). Open{" "}
          <a className="underline" href="/?hero=real">
            /?hero=real
          </a>{" "}
          to try again. This note only appears in development.
        </p>
      )}
    </>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Manifest />
      <LazyMount minHeight="100svh" className="bg-aiesec" data-shot="globe">
        <Suspense fallback={<div className="h-svh bg-aiesec" />}>
          <GlobeChapter />
        </Suspense>
      </LazyMount>
      <Doors />
      <LebanonTeaser />
      <Programs />
      <StoriesTeaser />
      <Showcases />
      <Company />
    </>
  );
}
