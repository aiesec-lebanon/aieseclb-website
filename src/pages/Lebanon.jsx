import PageHero from "../components/PageHero";
import HorizontalStory from "../components/HorizontalStory";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import Arrow from "../components/Arrow";
import { ONE_DAY, PLACES, QUICK_FACTS, WELCOME } from "../content/lebanon";
import { INCOMING_SITE, INCOMING_URL } from "../content/site";

export default function Lebanon() {
  return (
    <>
      <PageHero
        title={["Lebanon,", "all at once."]}
        lead="Snow and sea in the same day. Cities older than writing. A table that is never cleared. This is the country you would be living in."
        image="lebanon-hero"
        alt="The Lebanese coast seen from the mountains, with snow peaks above and the Mediterranean below"
        tone="day"
        seed={4}
        arabic="لبنان"
      />

      <section data-scheme="light" className="dawn-light bg-sky py-24 md:py-36">
        <div className="shell grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-end">
          <Reveal>
            <h2 className="display text-mega text-ink">
              <Lines text={["They say you can ski", "in the morning", "and swim by the afternoon."]} />
            </h2>
          </Reveal>
          <Reveal>
            <p className="fade text-lead text-ink-soft">
              It is true, and it is the best way to understand how much is packed into so little land. So here is that
              day, hour by hour, from the cedars to the sea.
            </p>
          </Reveal>
        </div>
      </section>

      {/* On a phone the day runs down the screen: a gold line through the hours, a stop at each one */}
      <section aria-label="One day across Lebanon" className="bg-night py-20 text-white md:hidden">
        <div className="shell">
          <Reveal>
            <p className="display text-[clamp(3.6rem,17vw,5.2rem)] text-sun">One day.</p>
            <p className="fade text-lead mt-4 text-white/80" style={{ "--i": 2 }}>
              Six stops, one small country, every landscape it has.
            </p>
          </Reveal>
          <ol className="relative mt-12 space-y-16 border-l border-sun/35 pl-7">
            {ONE_DAY.map((s, i) => (
              <li key={s.time} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[35px] top-5 h-3.5 w-3.5 rounded-full bg-sun shadow-[0_0_0_5px_var(--color-night),0_0_18px_4px_rgb(255_200_69/0.5)]"
                />
                <Reveal>
                  <p className="display text-[3.4rem] leading-none text-sun">{s.time}</p>
                  <p className="fade mt-1 font-bold text-white/72">{s.place}</p>
                  <div className="fade mt-5 overflow-clip rounded-[1.4rem]" style={{ "--i": 1 }}>
                    <Media name={s.image} alt={s.alt} tone={s.tone} seed={100 + i * 13} sizes="90vw" className="aspect-[4/3]" />
                  </div>
                  <h3 className="display-wide fade mt-5 text-[1.45rem] leading-[1.15]" style={{ "--i": 2 }}>
                    {s.title}
                  </h3>
                  <p className="fade mt-3 text-white/82" style={{ "--i": 3 }}>
                    {s.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <HorizontalStory label="One day across Lebanon" className="bg-night text-white max-md:hidden">
        <div className="flex w-[78vw] shrink-0 flex-col justify-center px-[7vw] md:w-[46vw]">
          <p className="display text-[clamp(4rem,11vw,11rem)] text-sun">One day.</p>
          <p className="text-lead mt-6 max-w-[24rem] text-white/80">Six stops, one small country, every landscape it has.</p>
        </div>
        {ONE_DAY.map((s, i) => (
          <article
            key={s.time}
            className={`flex w-[86vw] shrink-0 flex-col gap-6 px-4 md:w-[72vw] md:flex-row md:gap-12 md:px-[2.5vw] ${i % 2 ? "md:items-end md:pb-[6svh]" : "md:items-start md:pt-[6svh]"}`}
          >
            <div className="overflow-clip rounded-[1.8rem] md:w-[64%]">
              <Media
                name={s.image}
                alt={s.alt}
                tone={s.tone}
                seed={100 + i * 13}
                sizes="(max-width: 768px) 90vw, 52vw"
                className={`md:aspect-auto ${i % 2 ? "aspect-[4/5] md:h-[70svh]" : "aspect-[16/11] md:h-[64svh]"}`}
              />
            </div>
            <div className="md:w-[36%]">
              <p className="display text-[clamp(3rem,6.4vw,7rem)] text-sun">{s.time}</p>
              <p className="mt-1 font-bold text-white/72">{s.place}</p>
              <h3 className="display-wide mt-6 text-[clamp(1.45rem,2.3vw,2.25rem)] leading-[1.1]">{s.title}</h3>
              <p className="text-lead mt-4 text-white/82">{s.body}</p>
            </div>
          </article>
        ))}
        <div className="w-[10vw] shrink-0" />
      </HorizontalStory>

      <section data-shot="places" data-scheme="light" className="dawn-light bg-sky py-24 md:py-40">
        <div className="shell">
          <Reveal className="grid gap-8 md:grid-cols-2 md:items-end">
            <h2 className="display text-mega text-ink">
              <Lines text={["Places that", "stay with you."]} />
            </h2>
            <p className="fade text-lead max-w-[30rem] text-ink-soft md:justify-self-end" style={{ "--i": 2 }}>
              Everything here is a day trip from Beirut. Most of it is a morning.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
            {PLACES.map((p, i) => (
              <Reveal key={p.name} delay={(i % 4) * 90} className={i % 2 ? "lg:mt-16" : ""}>
                <article className="fade">
                  <div className="overflow-clip rounded-[1.6rem]">
                    <Media
                      name={p.image}
                      alt={p.name}
                      tone={p.tone}
                      seed={200 + i * 11}
                      className="unveil aspect-[4/5]"
                      imgClassName="zoom-out"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="display text-[1.9rem] text-ink">{p.name}</h3>
                    <span lang="ar" dir="rtl" className="arabic text-[1.15rem] text-aiesec">
                      {p.arabic}
                    </span>
                  </div>
                  <p className="mt-2 text-ink-soft">{p.line}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="blue-field py-24 text-white md:py-40">
        <div className="shell">
          <Reveal>
            <h2 className="display text-mega max-w-[14ch]">
              <Lines text={["You will not", "arrive alone."]} />
            </h2>
            <p className="fade text-lead mt-7 max-w-[36rem] text-white/90" style={{ "--i": 3 }}>
              An AIESEC exchange comes with people. That is the difference between visiting Lebanon and being taken
              in by it.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3">
            {WELCOME.map((w, i) => (
              <Reveal key={w.title} delay={i * 110}>
                <div className="fade h-full rounded-[1.8rem] bg-white/10 p-8 md:p-10">
                  <h3 className="display text-[clamp(1.9rem,2.8vw,2.8rem)] text-sun">{w.title}</h3>
                  <p className="mt-4 text-white/90">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:mt-24 md:grid-cols-[1fr_auto] md:items-end">
            <dl className="fade grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_FACTS.map((f) => (
                <div key={f.k}>
                  <dt className="text-[0.95rem] font-bold text-white/72">{f.k}</dt>
                  <dd className="display-wide mt-1 text-[1.25rem]">{f.v}</dd>
                </div>
              ))}
            </dl>
            <a
              href={INCOMING_URL}
              target="_blank"
              rel="noreferrer"
              className="fade group inline-flex h-14 items-center gap-3 rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
              style={{ "--i": 2 }}
            >
              Come to Lebanon
                <span className="text-[0.78em] font-semibold opacity-70">on {INCOMING_SITE}</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
