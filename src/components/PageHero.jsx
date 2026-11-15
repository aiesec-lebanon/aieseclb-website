import Media from "./Scenic";
import Reveal, { Lines } from "./Reveal";

// The opening of every inner page: a full-bleed picture that settles as you arrive, and a title
// that rises into it.
export default function PageHero({ title, lead, image, alt = "", tone = "dawn", seed = 1, arabic, children }) {
  return (
    <section className="relative isolate flex min-h-[92svh] items-end overflow-clip bg-night text-white">
      <Media
        name={image}
        alt={alt}
        tone={tone}
        seed={seed}
        priority
        className="!absolute inset-0 -z-20"
        imgClassName="hero-settle"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(3_11_28/0.42)_0%,rgb(3_11_28/0.08)_34%,rgb(3_11_28/0.80)_100%)]" />
      {arabic && (
        <div
          aria-hidden="true"
          lang="ar"
          dir="rtl"
          className="arabic parallax pointer-events-none absolute right-[4vw] top-[16vh] -z-10 text-[clamp(6rem,22vw,22rem)] leading-none text-white/14"
          style={{ "--py": "-5rem" }}
        >
          {arabic}
        </div>
      )}
      <Reveal className="is-in shell pb-14 pt-40 md:pb-20">
        <h1 id="page-title" tabIndex={-1} className="display text-hero max-w-[12ch] outline-none">
          <Lines text={title} />
        </h1>
        {lead && (
          <p className="fade text-lead mt-7 max-w-[36rem] text-white/88" style={{ "--i": 3 }}>
            {lead}
          </p>
        )}
        {children && (
          <div className="fade mt-9" style={{ "--i": 4 }}>
            {children}
          </div>
        )}
      </Reveal>
    </section>
  );
}
