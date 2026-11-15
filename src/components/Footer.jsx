import { Link } from "react-router-dom";
import logoWhite from "../assets/images/aiesec_logo_white.png";
import { NAV, SIGNUP_URL, SOCIALS } from "../content/site";
import Reveal, { Lines } from "./Reveal";

export default function Footer() {
  return (
    <footer data-shot="footer" className="relative isolate overflow-clip bg-night text-white">
      {/* the sun again, flat and whole, as at the top of the first page */}
      <div
        aria-hidden="true"
        className="parallax pointer-events-none absolute -right-[22vw] top-[4rem] -z-10 aspect-square w-[72vw] rounded-full bg-[linear-gradient(180deg,#ffd77e,#ffb347)] md:-right-[9vw] md:top-[6rem] md:w-[42vw]"
        style={{ "--py": "5rem" }}
      />

      <div className="shell pb-10 pt-[calc(38vw+5rem)] md:pt-40">
        <Reveal>
          <h2 className="display text-mega max-w-[13ch]">
            <Lines text={["Your first light", "starts here."]} />
          </h2>
          <div className="fade mt-10 flex flex-wrap gap-3" style={{ "--i": 3 }}>
            <a
              href={SIGNUP_URL}
              className="inline-flex h-14 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors duration-300 hover:bg-white"
            >
              Sign up with AIESEC
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

        <div className="mt-28 grid gap-12 border-t border-white/14 pt-10 md:mt-40 md:grid-cols-[1.4fr_1fr_1fr]">
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
            </ul>
          </nav>
          <ul className="space-y-2.5 text-lg">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-white/85 transition-colors hover:text-sun"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-14 text-sm text-white/62">© {new Date().getFullYear()} AIESEC in Lebanon. All rights reserved.</p>
      </div>
    </footer>
  );
}
