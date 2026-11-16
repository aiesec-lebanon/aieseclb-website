import { useState } from "react";
import PageHero from "../components/PageHero";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import Arrow from "../components/Arrow";
import { INCOMING_SITE, INCOMING_URL, MEMBER_URL, PROGRAMS, SIGNUP_URL } from "../content/site";

const BG = { ember: "bg-ember", teal: "bg-teal", tangerine: "bg-tangerine" };
const TEXT = { ember: "text-ember", teal: "text-teal", tangerine: "text-tangerine" };

const DETAIL = {
  volunteer: {
    who: "For anyone who wants to give time to something that needs it.",
    what: ["A project with a local organisation, built around one of the Sustainable Development Goals", "A team of volunteers from several countries", "A few weeks: long enough to matter, short enough to fit a summer"],
  },
  talent: {
    who: "For students and recent graduates who want their first serious line on a CV to be abroad.",
    what: ["An internship in a company or a startup", "Work in your field, with a job description agreed before you go", "Months, not weeks: time to actually learn the job and the place"],
  },
  teacher: {
    who: "For people who like explaining things, and want to find out if they are good at it.",
    what: ["A teaching placement in a school or a language centre", "Your own classes, with support from the school", "A country you will know from the inside by the time you leave"],
  },
};

const STEPS = {
  out: [
    { t: "Sign up", b: "Tell us who you are and what you are looking for. It takes a few minutes." },
    { t: "Talk to us", b: "Someone from the team in Beirut calls you. A student, like you, who has probably been on exchange." },
    { t: "Choose", b: "Together you look through open opportunities around the world until one fits." },
    { t: "Go", b: "We prepare you before you leave, and a local AIESEC team is waiting where you land." },
  ],
  in: [
    { t: "Find Lebanon", b: "Search the opportunities open in Lebanon on aiesec.org and apply to the ones that fit." },
    { t: "Meet the team", b: "You talk with the organisation you would work with, and with us, before anything is decided." },
    { t: "Prepare", b: "Your AIESEC office at home and the team in Beirut get you ready: paperwork, expectations, a place to live." },
    { t: "Arrive", b: "Someone is at the airport. From that evening on you have a team, and very likely a dinner invitation." },
  ],
};

export default function Exchange() {
  const [side, setSide] = useState("out");
  return (
    <>
      <PageHero
        title={["Go.", "Or come."]}
        lead="AIESEC runs exchange in both directions. Young people from Lebanon go out to volunteer, intern and teach. Young people from everywhere come to do the same here."
        image="exchange-hero"
        alt="Young people with backpacks walking toward a departure gate at sunrise"
        tone="dawn"
        seed={9}
      />

      <section data-scheme="light" className="bg-[linear-gradient(180deg,var(--color-sky)_0%,#eef4fb_45%,#f8efe2_100%)] py-24 md:py-36">
        <div className="shell">
          <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="display text-mega text-ink">
              <Lines text={["How it works."]} />
            </h2>
            <div
              role="tablist"
              aria-label="Which direction"
              // tabs behave as tabs: the arrow keys (and Home, End) move between them, and only the
              // chosen one is a Tab stop
              onKeyDown={(e) => {
                const order = ["out", "in"];
                const at = order.indexOf(side);
                const next =
                  e.key === "ArrowRight" ? order[(at + 1) % 2] : e.key === "ArrowLeft" ? order[(at + 1) % 2] : e.key === "Home" ? "out" : e.key === "End" ? "in" : null;
                if (!next) return;
                e.preventDefault();
                setSide(next);
                document.getElementById(`tab-${next}`)?.focus();
              }}
              className="fade flex w-full rounded-full bg-white p-1.5 shadow-[0_6px_30px_rgb(11_27_51/0.08)] sm:w-max"
              style={{ "--i": 2 }}
            >
              {[
                // on a phone the two halves share the column, with the short labels
                { id: "out", label: "I live in Lebanon", short: "From Lebanon" },
                { id: "in", label: "I am coming to Lebanon", short: "To Lebanon" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={side === t.id}
                  tabIndex={side === t.id ? 0 : -1}
                  aria-controls="steps-panel"
                  onClick={() => setSide(t.id)}
                  className={`flex-1 rounded-full px-3 py-3 text-[0.98rem] font-bold transition-colors duration-300 sm:flex-none sm:px-5 md:px-7 ${
                    side === t.id ? "bg-aiesec-deep text-white" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <span className="sm:hidden">{t.short}</span>
                  <span className="max-sm:hidden">{t.label}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <ol
            id="steps-panel"
            role="tabpanel"
            aria-labelledby={`tab-${side}`}
            key={side}
            className="steps-in relative mt-14 grid gap-12 md:mt-20 md:grid-cols-4 md:gap-8"
          >
            {/* the road the four steps are on, from AIESEC blue to the sun */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-[3.2rem] hidden h-[2px] bg-[linear-gradient(90deg,var(--color-aiesec-deep),var(--color-aiesec)_55%,var(--color-sun))] md:block"
            />
            {STEPS[side].map((s, i) => (
              <li key={s.t} className="relative" style={{ "--i": i }}>
                <span
                  aria-hidden="true"
                  className="display block text-[clamp(4.6rem,7.4vw,7rem)] leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_var(--color-aiesec-deep)]"
                >
                  0{i + 1}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute right-4 top-[2.75rem] hidden h-4 w-4 rounded-full shadow-[0_0_0_6px_#eef4fb] md:block ${
                    i === 3 ? "bg-sun shadow-[0_0_0_6px_#eef4fb,0_0_24px_8px_rgb(255_200_69/0.6)]" : "bg-aiesec-deep"
                  }`}
                />
                <h3 className="display mt-7 text-[clamp(2rem,3vw,2.9rem)] text-ink">{s.t}</h3>
                <p className="mt-3 max-w-[22rem] text-ink-soft">{s.b}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            {side === "out" ? (
              <a
                href={SIGNUP_URL}
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-aiesec-deep px-8 text-lg font-bold text-white transition-colors duration-300 hover:bg-night"
              >
                Go abroad
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
              </a>
            ) : (
              <a
                href={INCOMING_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-aiesec-deep px-8 text-lg font-bold text-white transition-colors duration-300 hover:bg-night"
              >
                Come to Lebanon
                <span className="text-[0.78em] font-semibold opacity-70">on {INCOMING_SITE}</span>
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {PROGRAMS.map((p, i) => (
        <section
          key={p.id}
          id={p.id}
          className={`relative isolate flex min-h-[100svh] scroll-mt-0 items-end overflow-clip text-ink md:items-center ${BG[p.color]}`}
          style={{ "--prog": `var(--color-${p.color})` }}
        >
          {/* Like the page's cover: the photograph fills the screen, whatever the screen, and the
              words are sized to the screen too (its width and its height), so they fit on a phone,
              a short laptop and a wide monitor alike. The programme's colour comes in from the
              side the words are on; on a phone it rises from below, behind the words themselves. */}
          <Media
            name={p.image}
            alt={`${p.name}: young people on exchange`}
            tone={p.color}
            seed={300 + i * 17}
            sizes="100vw"
            className="!absolute inset-0 -z-20"
            imgClassName="zoom-out"
          />
          <div
            aria-hidden="true"
            className={`absolute inset-0 -z-10 hidden md:block ${
              i % 2
                ? "bg-[linear-gradient(to_left,var(--prog)_0%,var(--prog)_36%,color-mix(in_oklab,var(--prog)_72%,transparent)_52%,transparent_74%)]"
                : "bg-[linear-gradient(to_right,var(--prog)_0%,var(--prog)_36%,color-mix(in_oklab,var(--prog)_72%,transparent)_52%,transparent_74%)]"
            }`}
          />
          <div className="shell grid md:grid-cols-2 md:gap-16 md:pb-14 md:pt-28">
            <Reveal
              className={`max-md:-mx-5 max-md:bg-[linear-gradient(to_top,var(--prog)_0%,var(--prog)_78%,transparent_100%)] max-md:px-5 max-md:pb-10 max-md:pt-28 ${i % 2 ? "md:col-start-2" : ""}`}
            >
              <p className="fade font-bold">{p.name}</p>
              <h2 className="display mt-2 text-[clamp(3rem,min(11vw,14svh),10.5rem)]">
                <Lines text={[`${p.verb}.`]} />
              </h2>
              <p className="display-wide fade mt-4 text-[clamp(1.15rem,min(2vw,3.2svh),1.9rem)]" style={{ "--i": 2 }}>
                {p.line}
              </p>
              <p className="fade mt-3 max-w-[32rem] text-[clamp(1rem,min(1.35vw,2.5svh),1.25rem)]" style={{ "--i": 3 }}>
                {DETAIL[p.id].who}
              </p>
              <ul className="fade mt-5 space-y-2 text-[clamp(0.95rem,min(1.2vw,2.3svh),1.15rem)]" style={{ "--i": 4 }}>
                {DETAIL[p.id].what.map((w) => (
                  <li key={w} className="flex gap-3 border-t border-ink/20 pt-2">
                    <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-ink" />
                    {w}
                  </li>
                ))}
              </ul>
              {/* straight to this programme's own form on the sign-up portal (signup/<id>) */}
              <div className="fade mt-[clamp(1.25rem,4svh,2.5rem)] flex flex-wrap items-center gap-x-6 gap-y-4" style={{ "--i": 5 }}>
                <a
                  href={`${SIGNUP_URL}/${p.id}`}
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-ink px-8 text-lg font-bold text-white transition-colors duration-300 hover:bg-night"
                >
                  Apply for {p.name}
                  <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
                </a>
                <a href={p.incoming} target="_blank" rel="noreferrer" className="font-bold underline decoration-2 underline-offset-4">
                  Coming from abroad? It is on {INCOMING_SITE}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="bg-night py-24 text-white md:py-40">
        <div className="shell grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-end">
          <Reveal>
            <p className="fade font-bold text-sun">Membership</p>
            <h2 className="display text-mega mt-3">
              <Lines text={["Or stay,", "and run it."]} />
            </h2>
          </Reveal>
          <Reveal>
            <p className="fade text-lead text-white/85">
              Every exchange in this country is organised by students. Join a team at your university, learn to sell,
              to plan, to lead people older than you, and to be responsible for someone else's best summer.
            </p>
            <a
              href={MEMBER_URL}
              className="fade group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
              style={{ "--i": 2 }}
            >
              Become a member
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
            </a>
          </Reveal>
        </div>
      </section>
      <span className={`hidden ${TEXT.ember} ${TEXT.teal} ${TEXT.tangerine}`} />
    </>
  );
}
