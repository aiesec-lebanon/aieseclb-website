import { Link } from "react-router-dom";
import logoWhite from "../assets/images/aiesec_logo_white.png";
import { CONTACT, NAV, PORTALS, SIGNUP_URL, SOCIALS, portalHref } from "../content/site";
import Reveal, { Lines } from "./Reveal";
import ContactIcon from "./ContactIcon";

// compact: for a page that already ends with its own call to action, the footer leaves out its
// own (two big "start here" blocks in a row said the same thing twice)
export default function Footer({ compact = false }) {
  return (
    <footer data-shot="footer" className="relative isolate overflow-clip bg-night text-white">
      {/* the sun again, flat and whole, as at the top of the first page */}
      <div
        aria-hidden="true"
        className={`parallax pointer-events-none absolute -z-10 aspect-square rounded-full ${
          compact ? "-right-[14vw] -top-[10vw] w-[40vw] md:-right-[6vw] md:-top-[8vw] md:w-[22vw]" : "-right-[22vw] top-[4rem] w-[72vw] md:-right-[9vw] md:top-[6rem] md:w-[42vw]"
        }  bg-[radial-gradient(circle_at_38%_32%,#fff4d0_0%,#ffd77e_32%,#ffb347_70%,#f48924_100%)] shadow-[0_0_80px_20px_rgb(255_200_69/0.35),0_0_220px_80px_rgb(255_160_60/0.18)]`}
        style={{ "--py": "5rem" }}
      />

      <div className={`shell pb-10 ${compact ? "pt-16 md:pt-20" : "pt-[calc(38vw+5rem)] md:pt-40"}`}>
        {!compact && (
          <Reveal>
            <h2 className="display text-mega max-w-[13ch]">
              <Lines text={["Your first light", "starts here."]} />
            </h2>
            <div className="fade mt-10 flex flex-wrap gap-3" style={{ "--i": 3 }}>
              <a
                href={SIGNUP_URL}
                className="inline-flex h-14 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
              >
                Go abroad
              </a>
              <Link
                to="/exchange"
                viewTransition
                className="inline-flex h-14 items-center rounded-full border border-white/40 px-8 text-lg font-bold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                See the programmes
              </Link>
            </div>
          </Reveal>
        )}

        <div className={`grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] ${compact ? "" : "mt-28 border-t border-white/14 pt-10 md:mt-40"}`}>
          <div>
            <img src={logoWhite} alt="AIESEC" className="h-7 w-auto" />
            <p className="mt-5 max-w-[26rem] text-white/72">
              AIESEC in Lebanon. Founded in Beirut in 2011. Run entirely by young people, for young people.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="space-y-2.5 text-lg">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} viewTransition className="font-bold text-white/85 transition-colors hover:text-sun">
                    {n.label}
                  </Link>
                </li>
              ))}
              {/* the portals for partners and future members */}
              {PORTALS.map((p, i) => (
                <li key={p.id} className={i === 0 ? "pt-5" : undefined}>
                  {p.url ? (
                    <a href={p.url} className="font-bold text-sun transition-colors hover:text-white">
                      {p.long}
                    </a>
                  ) : (
                    <Link to={portalHref(p)} className="font-bold text-sun transition-colors hover:text-white">
                      {p.long}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-white/60">Get in touch</h2>
            <ul className="mt-4 space-y-2.5 text-lg">
              {CONTACT.email && (
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-3 font-bold text-white/85 transition-colors hover:text-sun">
                    <ContactIcon name="email" />
                    {CONTACT.email}
                  </a>
                </li>
              )}
              {CONTACT.place && <li className="text-white/72">{CONTACT.place}</li>}
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 font-bold text-white/85 transition-colors hover:text-sun"
                  >
                    <ContactIcon name={s.label} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-14 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/62">
          <span>© {new Date().getFullYear()} AIESEC in Lebanon. All rights reserved.</span>
          {CONTACT.privacy && (
            <a href={CONTACT.privacy} className="underline underline-offset-4 hover:text-white">
              Privacy
            </a>
          )}
        </p>
      </div>
    </footer>
  );
}
