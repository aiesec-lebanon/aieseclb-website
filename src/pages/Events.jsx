import { lazy, Suspense } from "react";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import { hasGen } from "../lib/media";
import SampleNote from "../components/SampleNote";
import { EVENTS } from "../content/events";
import { SIGNUP_URL } from "../content/site";

const EventRing = lazy(() => import("../scenes/EventRing"));

export default function Events() {
  return (
    <>
      <section className="relative isolate overflow-clip bg-night text-white">
        <div className="shell relative z-10 pt-28 text-center md:pt-32">
          <Reveal className="is-in">
            <h1 id="page-title" tabIndex={-1} className="display text-title outline-none md:text-[clamp(3rem,6.4vw,6.4rem)]">
              <Lines text={["What we gather for."]} />
            </h1>
            <p className="fade text-lead mx-auto mt-4 max-w-[34rem] text-white/80" style={{ "--i": 2 }}>
              The year has a rhythm. These are the days it is built around. Drag the ring, or use the arrows.
            </p>
          </Reveal>
        </div>
        <Suspense fallback={<div className="h-[62svh]" />}>
          <EventRing events={EVENTS} />
        </Suspense>
      </section>

      <div className="bg-sky">
        <SampleNote file="src/content/events.js" />
      </div>

      <section className="bg-sky py-24 md:py-36">
        <div className="shell">
          <Reveal>
            <h2 className="display text-mega text-ink">
              <Lines text={["The year,", "one gathering at a time."]} />
            </h2>
          </Reveal>
          <div className="mt-14 md:mt-20">
            {EVENTS.map((e, i) => (
              <Reveal key={e.id}>
                <article
                  id={e.id}
                  className="fade group grid gap-6 border-t border-ink/14 py-10 md:grid-cols-[1fr_1.1fr_0.9fr] md:items-center md:gap-12 md:py-14"
                >
                  <div>
                    <p className="font-bold text-aiesec">{e.kind}</p>
                    <h3 className="display mt-2 text-[clamp(2.2rem,4.2vw,4.2rem)] text-ink">{e.name}</h3>
                  </div>
                  <div>
                    <p className="text-lead text-ink">{e.line}</p>
                    <p className="mt-4 font-bold text-ink-soft">
                      {e.where} · {e.when}
                    </p>
                  </div>
                  <div className="overflow-clip rounded-[1.6rem]">
                    <Media
                      name={hasGen(e.image) || !e.stand ? e.image : e.stand}
                      alt={e.name}
                      tone={e.tone}
                      seed={400 + i * 9}
                      className="aspect-[16/11]"
                      imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-aiesec py-24 text-white md:py-36">
        <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display text-mega max-w-[13ch]">
              <Lines text={["The next one", "has a seat for you."]} />
            </h2>
          </Reveal>
          <a
            href={SIGNUP_URL}
            className="inline-flex h-14 w-max items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
          >
            Join AIESEC in Lebanon
          </a>
        </div>
      </section>
    </>
  );
}
