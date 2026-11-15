import { useState } from "react";
import PageHero from "../components/PageHero";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import Arrow from "../components/Arrow";
import { PROGRAMS, SIGNUP_URL } from "../content/site";

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

      <section className="bg-sky py-24 md:py-36">
        <div className="shell">
          <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="display text-mega text-ink">
              <Lines text={["How it works."]} />
            </h2>
            <div
              role="tablist"
              aria-label="Which direction"
              className="fade flex w-max rounded-full bg-white p-1.5 shadow-[0_6px_30px_rgb(11_27_51/0.08)]"
              style={{ "--i": 2 }}
            >
              {[
                { id: "out", label: "I live in Lebanon" },
                { id: "in", label: "I am coming to Lebanon" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={side === t.id}
                  aria-controls="steps-panel"
                  onClick={() => setSide(t.id)}
                  className={`rounded-full px-5 py-3 text-[0.98rem] font-bold transition-colors duration-300 md:px-7 ${
                    side === t.id ? "bg-aiesec text-white" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Reveal>

          <ol
            id="steps-panel"
            role="tabpanel"
            aria-labelledby={`tab-${side}`}
            key={side}
            className="steps-in mt-14 grid gap-5 md:mt-20 md:grid-cols-4"
          >
            {STEPS[side].map((s, i) => (
              <li
                key={s.t}
                className="rounded-[1.8rem] bg-white p-8 shadow-[0_6px_30px_rgb(11_27_51/0.06)]"
                style={{ "--i": i }}
              >
                <h3 className="display text-[clamp(2rem,3vw,3rem)] text-aiesec">{s.t}</h3>
                <p className="mt-4 text-ink-soft">{s.b}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            {side === "out" ? (
              <a
                href={SIGNUP_URL}
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-aiesec px-8 text-lg font-bold text-white transition-colors duration-300 hover:bg-night"
              >
                Sign up from Lebanon
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
              </a>
            ) : (
              <a
                href="https://aiesec.org"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-aiesec px-8 text-lg font-bold text-white transition-colors duration-300 hover:bg-night"
              >
                Search opportunities in Lebanon
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {PROGRAMS.map((p, i) => (
        <section key={p.id} id={p.id} className={`scroll-mt-0 text-white ${BG[p.color]}`}>
          <div className={`shell grid gap-10 py-24 md:grid-cols-2 md:items-center md:gap-16 md:py-36`}>
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <p className="fade font-bold text-white/90">{p.name}</p>
              <h2 className="display mt-3 text-[clamp(4rem,11vw,11.5rem)]">
                <Lines text={[`${p.verb}.`]} />
              </h2>
              <p className="display-wide fade mt-6 text-[clamp(1.3rem,2.1vw,1.9rem)]" style={{ "--i": 2 }}>
                {p.line}
              </p>
              <p className="fade text-lead mt-5 max-w-[32rem] text-white/92" style={{ "--i": 3 }}>
                {DETAIL[p.id].who}
              </p>
              <ul className="fade mt-8 space-y-3" style={{ "--i": 4 }}>
                {DETAIL[p.id].what.map((w) => (
                  <li key={w} className="flex gap-3 border-t border-white/25 pt-3 text-white/95">
                    <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-white" />
                    {w}
                  </li>
                ))}
              </ul>
            </Reveal>
            <div className="overflow-clip rounded-[2rem] md:rounded-[2.6rem]">
              <Media
                name={p.image}
                alt={`${p.name}: young people on exchange`}
                tone={p.color}
                seed={300 + i * 17}
                className="unveil aspect-[4/5]"
                imgClassName="zoom-out"
              />
            </div>
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
              href={SIGNUP_URL}
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
