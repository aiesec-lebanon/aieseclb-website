import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import DawnHero from "../scenes/DawnHero";
import Reveal, { Lines } from "../components/Reveal";
import Counter from "../components/Counter";
import Media from "../components/Scenic";
import LogoMarquee from "../components/LogoMarquee";
import Arrow from "../components/Arrow";
import LazyMount from "../components/LazyMount";
import { PROGRAMS, SIGNUP_URL, STATS, UNIVERSITIES } from "../content/site";

const GlobeChapter = lazy(() => import("../scenes/GlobeChapter"));

const logos = import.meta.glob("../assets/images/*_logo.png", { eager: true, query: "?url", import: "default" });
const logoUrl = (file) => logos[`../assets/images/${file}`];

const MANIFEST =
  "AIESEC is a global organisation run entirely by youth, for youth. Since 1948 it has helped young people find the leader in themselves through real experiences abroad. In Lebanon, that work has had a home in Beirut since 2011.";

function Manifest() {
  const words = MANIFEST.split(" ");
  return (
    <section data-shot="manifest" className="bg-sky pb-24 pt-28 md:pb-36 md:pt-44">
      <div className="shell">
        <p className="display ink-fill max-w-[30ch] text-[clamp(2.2rem,6.1vw,6.2rem)] leading-[0.98] text-ink">
          {words.map((w, i) => (
            <span key={i} style={{ "--i": i, "--step": `${46 / words.length}%` }}>
              {w}{" "}
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
    <section data-shot="doors" className="bg-sky pb-28 pt-24 md:pb-40 md:pt-36">
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
        <Reveal>
          <h2 className="display text-mega max-w-[15ch]">
            <Lines text={["Small enough to cross", "in a morning.", "Deep enough for a lifetime."]} />
          </h2>
        </Reveal>

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
    <section data-shot="programs" className="bg-sky py-28 md:py-44">
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
    <section data-shot="company" className="bg-white py-28 md:py-40">
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

export default function Home() {
  return (
    <>
      <DawnHero />
      <Manifest />
      <LazyMount minHeight="100svh" className="bg-aiesec" data-shot="globe">
        <Suspense fallback={<div className="h-svh bg-aiesec" />}>
          <GlobeChapter />
        </Suspense>
      </LazyMount>
      <Doors />
      <LebanonTeaser />
      <Programs />
      <Showcases />
      <Company />
    </>
  );
}
