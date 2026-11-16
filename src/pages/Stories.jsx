import { useState } from "react";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import Route from "../components/Route";
import Arrow from "../components/Arrow";
import SampleNote from "../components/SampleNote";
import { STORIES, storyPhoto as photo } from "../content/stories";
import { INCOMING_SITE, INCOMING_URL, PROGRAMS, SIGNUP_URL } from "../content/site";
import "@fontsource/instrument-serif/400-italic.css";

const programme = (id) => PROGRAMS.find((p) => p.id === id);
// the AIESEC colour of each programme, carrying ink (white on them is too faint to read)
const CHIP = { ember: "bg-ember", teal: "bg-teal", tangerine: "bg-tangerine" };

const FILTERS = [
  { id: "all", label: "Every story" },
  { id: "out", label: "From Lebanon, out" },
  { id: "in", label: "From everywhere, in" },
];

function Chapter({ s, i }) {
  const prog = programme(s.programme);
  const flip = i % 2 === 1;
  return (
    <article id={s.id} className="shell grid gap-10 py-20 md:grid-cols-12 md:items-center md:gap-14 md:py-28">
      <div className={`relative md:col-span-5 ${flip ? "md:order-2" : ""}`}>
        <div className="overflow-clip rounded-[2rem]">
          <Media name={photo(s, 0)} alt={`${s.name}, on exchange in ${s.to.city}`} tone="dawn" seed={700 + i * 11} sizes="(max-width: 768px) 92vw, 40vw" className="unveil aspect-[4/5]" imgClassName="zoom-out" />
        </div>
        {/* two more photographs, laid on the table like prints */}
        <div className={`absolute -bottom-10 hidden w-[46%] md:block ${flip ? "-left-10 -rotate-6" : "-right-10 rotate-6"}`}>
          <div className="parallax rounded-[0.4rem] bg-white p-2 pb-7 shadow-[0_24px_60px_rgb(0_0_0/0.45)]" style={{ "--py": "2.4rem" }}>
            <Media name={photo(s, 1)} alt="" tone="day" seed={705 + i * 11} sizes="20vw" className="aspect-[4/3] rounded-[0.15rem]" />
          </div>
        </div>
      </div>
      <Reveal className="relative z-10 md:col-span-7">
        <p className="fade flex flex-wrap items-center gap-3 font-bold">
          <span className={`rounded-full px-3.5 py-1 text-[0.9rem] text-ink ${CHIP[prog.color]}`}>{prog.name}</span>
          <span className="text-white/70">{s.when}</span>
          {import.meta.env.DEV && s.sample && (
            <span className="rounded-full bg-sun px-2.5 py-0.5 text-[0.75rem] font-extrabold uppercase tracking-wide text-ink">Sample</span>
          )}
        </p>
        <h2 className="display mt-5 text-[clamp(3rem,6vw,6rem)]">
          <Lines text={[s.name]} />
        </h2>
        <Route from={s.from} to={s.to} className="fade mt-4 max-w-[30rem] text-white/80" />
        <blockquote className="fade mt-8 text-[clamp(1.7rem,2.9vw,2.8rem)] italic leading-[1.15] text-sun" style={{ fontFamily: '"Instrument Serif", Georgia, serif', "--i": 2 }}>
          “{s.quote}”
        </blockquote>
        <div className="fade mt-6 max-w-[38rem] space-y-4 text-lead text-white/82" style={{ "--i": 3 }}>
          {s.story.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
        <div className="fade mt-8 overflow-clip rounded-[1.4rem] md:hidden" style={{ "--i": 4 }}>
          <Media name={photo(s, 1)} alt="" tone="day" seed={705 + i * 11} sizes="92vw" className="aspect-[16/10]" />
        </div>
      </Reveal>
    </article>
  );
}

export default function Stories() {
  const [filter, setFilter] = useState("all");
  const list = STORIES.filter((s) => filter === "all" || s.direction === filter);
  return (
    <>
      {/* Back with stories: photographs coming up through first light like postcards */}
      <section className="relative isolate overflow-clip bg-[linear-gradient(180deg,#030b1c_0%,#06142e_55%,#0b2350_100%)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_80%_at_50%_100%,rgb(255_200_69/0.22),transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {STORIES.slice(0, 6).map((s, i) => {
            const spots = ["left-[4%] top-[18%] w-[13vw] -rotate-6", "left-[16%] top-[58%] w-[11vw] rotate-3", "right-[6%] top-[14%] w-[12vw] rotate-6", "right-[18%] top-[56%] w-[14vw] -rotate-3", "left-[25%] top-[84%] w-[8vw] rotate-2", "right-[34%] top-[6%] w-[8vw] -rotate-2"];
            return (
              <div key={s.id} className={`parallax absolute hidden rounded-[0.3rem] bg-white p-1.5 pb-5 opacity-80 shadow-[0_20px_50px_rgb(0_0_0/0.5)] md:block ${spots[i]}`} style={{ "--py": `${3 + i * 1.4}rem` }}>
                <Media name={photo(s, 0)} alt="" tone="dawn" seed={760 + i} sizes="14vw" className="aspect-[4/5] rounded-[0.1rem]" />
              </div>
            );
          })}
        </div>
        <div className="shell relative flex min-h-[86svh] flex-col items-center justify-center pb-20 pt-36 text-center">
          <Reveal className="is-in">
            <h1 id="page-title" tabIndex={-1} className="display text-title mx-auto max-w-[12ch] outline-none md:text-[clamp(3.4rem,7vw,7.4rem)]">
              <Lines text={["Back with", "stories."]} />
            </h1>
            <p className="fade text-lead mx-auto mt-6 max-w-[34rem] text-white/80" style={{ "--i": 2 }}>
              People who went out from Lebanon, and people who came to it. In their own words, with their own photographs.
            </p>
          </Reveal>
          {/* which stories */}
          <div role="group" aria-label="Show stories" className="mt-10 flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-5 py-2.5 font-bold transition-colors duration-300 ${
                  filter === f.id ? "border-sun bg-sun text-ink" : "border-white/30 bg-night/60 text-white/90 backdrop-blur-md hover:border-white/70 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[#0b2350]">
        <SampleNote file="src/content/stories.js">
          Waiting for real stories. The six people here are samples, their words and routes made up for the design, their
          photographs stand-ins.
        </SampleNote>
      </div>

      <section aria-label="Stories" className="bg-[linear-gradient(180deg,#0b2350_0%,#06142e_18%,#030b1c_100%)] pb-16 text-white">
        {list.map((s, i) => (
          <Chapter key={s.id} s={s} i={i} />
        ))}
      </section>

      <section className="blue-field py-24 text-white md:py-36">
        <div className="shell grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
          <Reveal>
            <h2 className="display text-mega max-w-[13ch]">
              <Lines text={["Your story", "starts with", "one form."]} />
            </h2>
          </Reveal>
          <Reveal>
            <p className="fade text-lead text-white/90">Go out from Lebanon to volunteer, work or teach, or come to Lebanon from wherever you are.</p>
            <div className="fade mt-8 flex flex-wrap gap-3" style={{ "--i": 2 }}>
              <a href={SIGNUP_URL} target="_blank" rel="noreferrer" className="group inline-flex h-14 items-center gap-3 rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white">
                Go abroad
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
              </a>
              <a href={INCOMING_URL} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/40 px-8 text-lg font-bold text-white transition-colors duration-300 hover:border-white hover:bg-white/10">
                Come to Lebanon
                <span className="text-[0.78em] font-semibold opacity-70">on {INCOMING_SITE}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
