import { lazy, Suspense } from "react";
import Reveal, { Lines } from "../components/Reveal";
import Media from "../components/Scenic";
import World, { Frame, SceneryToggle } from "../components/World";
import { BACKDROP_CROP, headingProps } from "../components/worldType";
import Backdrop from "../components/Backdrop";
import SampleNote from "../components/SampleNote";
import { hasGen } from "../lib/media";
import { EVENTS } from "../content/events";
import { MEMBER_URL } from "../content/site";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/shantell-sans/700.css";
import "@fontsource/shantell-sans/800.css";
import "@fontsource-variable/figtree";

const EventRing = lazy(() => import("../scenes/EventRing"));

const NIGHT = "#030b1c";
const photoOf = (e) => (hasGen(`${e.image}-2`) ? `${e.image}-2` : hasGen(e.image) || !e.stand ? e.image : e.stand);

export default function Events() {
  const last = EVENTS[EVENTS.length - 1].world;
  return (
    <>
      <section className="relative isolate overflow-clip bg-night text-white">
        <div className="shell relative z-10 pt-28 text-center md:pt-32">
          <Reveal className="is-in">
            <h1 id="page-title" tabIndex={-1} className="display text-title outline-none md:text-[clamp(3rem,6.4vw,6.4rem)]">
              <Lines text={["What we gather for."]} />
            </h1>
            <p className="fade text-lead mx-auto mt-4 max-w-[34rem] text-white/80" style={{ "--i": 2 }}>
              The year has a rhythm. These are the days it is built around. Drag the ring, or use the arrows, then
              scroll down and walk into each one.
            </p>
          </Reveal>
        </div>
        <Suspense fallback={<div className="h-[62svh]" />}>
          <EventRing events={EVENTS} />
        </Suspense>
        <SampleNote file="src/content/events.js">
          Waiting for the real event list and photographs. The six events below are samples: their names, dates and
          places, and four of their photographs are stand-ins.
        </SampleNote>
      </section>

      {/* One world per event: the page becomes the event as you reach it (components/World.jsx;
          each event's world is in content/events.js) */}
      <div className="relative">
        {EVENTS.map((e, i) => {
          const w = e.world;
          const h = headingProps(w);
          return (
            <World
              key={e.id}
              id={e.id}
              world={w}
              textSide={i % 2 ? "right" : "left"}
              from={i ? EVENTS[i - 1].world.bg : NIGHT}
              label={e.name}
              backdrop={<Backdrop photo={photoOf(e)} world={w} textSide={i % 2 ? "right" : "left"} />}
              className="flex min-h-[150svh] items-center"
            >
              <div className="shell grid items-center gap-10 py-[34svh] md:grid-cols-12 md:gap-14">
                <Reveal className={`relative z-10 md:col-span-5 ${i % 2 ? "md:order-2 md:pl-2" : "md:pr-2"}`}>
                  <p className="fade font-bold text-[var(--w-accent-ink)]">
                    {e.kind}
                    {/* while developing: which events are still placeholders */}
                    {import.meta.env.DEV && e.sample && (
                      <span className="ml-3 inline-block rounded-full bg-sun px-2.5 py-0.5 align-middle text-[0.75rem] font-extrabold uppercase tracking-wide text-ink">
                        Sample
                      </span>
                    )}
                  </p>
                  <h2 className={`mt-3 ${h.className}`} style={h.style}>
                    <Lines text={[e.name]} />
                  </h2>
                  <p className="fade text-lead mt-6" style={{ "--i": 2 }}>
                    {e.line}
                  </p>
                  <p className="fade mt-5 font-bold text-[var(--w-soft)]" style={{ "--i": 3 }}>
                    {e.where} · {e.when}
                  </p>
                </Reveal>
                <div className="max-md:order-first md:col-span-7">
                  <Reveal>
                  <div className="rise-in">
                    <Frame world={w}>
                      {/* the middle of the photograph; the rest of it carries on behind, in 3D */}
                      <div data-backdrop-frame="" style={{ "--crop": BACKDROP_CROP }}>
                        <Media
                          name={photoOf(e)}
                          alt={e.name}
                          tone={e.tone}
                          seed={400 + i * 9}
                          sizes="(max-width: 768px) 92vw, 58vw"
                          className="aspect-[16/10]"
                          imgClassName="scale-[var(--crop)]"
                        />
                      </div>
                    </Frame>
                  </div>
                  </Reveal>
                </div>
              </div>
            </World>
          );
        })}
        <SceneryToggle />
      </div>

      <section className="blue-field text-white">
        <div aria-hidden="true" className="h-[22svh]" style={{ background: `linear-gradient(${last.bg}, var(--color-aiesec-deep))` }} />
        <div className="shell flex flex-col gap-8 pb-24 pt-4 md:flex-row md:items-end md:justify-between md:pb-36">
          <Reveal>
            <h2 className="display text-mega max-w-[13ch]">
              <Lines text={["The next one", "has a seat for you."]} />
            </h2>
          </Reveal>
          <a
            href={MEMBER_URL}
            className="inline-flex h-14 w-max items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
          >
            Join AIESEC in Lebanon
          </a>
        </div>
      </section>
    </>
  );
}
