import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoWhite from "../assets/images/aiesec_logo_white.png";
import logoBlue from "../assets/images/aiesec_logo_wide_blue.png";
import { NAV, PORTALS, SIGNUP_URL, portalHref } from "../content/site";
import { glideToTop } from "../lib/scroll";

// a portal link: the live site once its url is set, the platform's section on /platforms until then
function PortalLink({ portal, className, onClick, children }) {
  const label = children || portal.label;
  return portal.url ? (
    <a href={portal.url} className={className} onClick={onClick}>
      {label}
    </a>
  ) : (
    <Link to={portalHref(portal)} className={className} onClick={onClick}>
      {label}
    </Link>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  // the nav takes the scheme of whatever is under it: sections say data-scheme="light" when
  // they are light (the worlds on the events and platforms pages, for one)
  const [light, setLight] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    // at most once a frame: scroll events come faster than frames, and each look is a hit test
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // the header stays on screen (the logo is the way home); it only gets more compact
        setCompact(window.scrollY > 40);
        probe();
      });
    };
    const probe = () => {
      let scheme = "dark";
      for (const el of document.elementsFromPoint(window.innerWidth / 2, 40)) {
        if (el.closest("header")) continue;
        const owner = el.closest("[data-scheme]");
        if (owner) scheme = owner.dataset.scheme;
        break;
      }
      setLight(scheme === "light");
    };
    onScroll();
    // a new page mounts after the route changes (and lazily): look again once it is there
    const later = [120, 600].map((ms) => setTimeout(probe, ms));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      later.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    // while the menu covers the page, what is behind it cannot be reached by Tab or a screen reader
    const behind = [document.getElementById("main"), document.querySelector("body > div footer, footer")].filter(Boolean);
    behind.forEach((el) => (el.inert = open));
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-sun px-5 py-3 font-bold text-ink transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header data-scheme={light ? "light" : "dark"} className="fixed inset-x-0 top-0 z-50">
        <div className="shell pt-4 md:pt-5">
          <div
            className={`flex items-center justify-between rounded-full border pl-5 pr-2 transition-[background-color,border-color,height,box-shadow] duration-500 md:pl-7 ${
              light ? "border-ink/10" : "border-white/12"
            } ${
              compact
                ? `h-14 shadow-[0_10px_40px_rgb(3_11_28/0.28)] backdrop-blur-xl ${light ? "bg-white/82" : "bg-night/72"}`
                : `h-16 backdrop-blur-md ${light ? "bg-white/50" : "bg-night/28"}`
            }`}
          >
            <Link
              to="/"
              viewTransition
              aria-label="AIESEC in Lebanon, home"
              className="flex items-center gap-3"
              onClick={(e) => {
                // already home: a link to the same page does nothing, so take the visitor to the top
                if (pathname === "/") {
                  e.preventDefault();
                  glideToTop();
                }
              }}
            >
              {/* the white logo over dark worlds, the blue one over light ones */}
              <span className="relative block aspect-[1265/259] h-[1.35rem] md:h-6">
                <img src={logoWhite} alt="AIESEC" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${light ? "opacity-0" : "opacity-100"}`} />
                <img src={logoBlue} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${light ? "opacity-100" : "opacity-0"}`} />
              </span>
              <span
                className={`hidden border-l pl-3 text-[0.95rem] font-bold transition-colors duration-500 sm:block ${
                  light ? "border-ink/20 text-ink/85" : "border-white/25 text-white/90"
                }`}
              >
                in Lebanon
              </span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  viewTransition
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-[0.98rem] font-bold xl:px-4 transition-colors duration-300 ${
                      light
                        ? isActive
                          ? "bg-ink/8 text-ink"
                          : "text-ink/75 hover:bg-ink/6 hover:text-ink"
                        : isActive
                          ? "bg-white/16 text-white"
                          : "text-white/78 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* the doors for partners and future members, on the right with sign-up */}
              {PORTALS.map((p) => (
                <PortalLink
                  key={p.id}
                  portal={p}
                  className={`hidden rounded-full border px-4 py-1.5 text-[0.95rem] font-bold transition-colors duration-300 lg:inline-block ${
                    light ? "border-ink/20 text-ink/80 hover:border-ink/50 hover:text-ink" : "border-white/25 text-white/85 hover:border-white/60 hover:text-white"
                  }`}
                />
              ))}
              <a
                href={SIGNUP_URL}
                className={`inline-flex items-center rounded-full bg-sun px-4 text-[0.95rem] font-bold text-ink transition-[background-color,height] duration-300 hover:bg-white sm:px-5 sm:text-base ${
                  compact ? "h-10" : "h-10 sm:h-12"
                }`}
              >
                Sign up
              </a>
              <button
                type="button"
                className={`grid h-11 w-11 place-items-center rounded-full transition-colors duration-500 lg:hidden ${
                  light && !open ? "bg-ink/8 text-ink" : "bg-white/10 text-white"
                }`}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                <span className="relative block h-3.5 w-5">
                  <span
                    className={`absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                      open ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                      open ? "top-1.5 -rotate-45" : "top-3"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-night text-white transition-[clip-path,visibility] duration-700 ease-[var(--ease-in-out-quart)] overflow-y-auto overscroll-contain lg:hidden ${
          open ? "visible [clip-path:circle(150vmax_at_100%_0)]" : "invisible [clip-path:circle(0_at_100%_0)]"
        }`}
        inert={!open}
      >
        <nav aria-label="Mobile" className="shell flex min-h-full flex-col justify-center gap-2 pb-10 pt-24">
          {[{ to: "/", label: "Home" }, ...NAV].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              viewTransition
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `display py-1 text-[clamp(2.6rem,13vw,4.5rem)] ${isActive ? "text-sun" : "text-white"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-6 flex flex-wrap gap-3">
            {PORTALS.map((p) => (
              <PortalLink
                key={p.id}
                portal={p}
                onClick={() => setOpen(false)}
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-lg font-bold text-white"
              >
                {p.long}
              </PortalLink>
            ))}
          </div>
          <a
            href={SIGNUP_URL}
            className="mt-6 inline-flex h-14 w-max items-center rounded-full bg-sun px-8 text-lg font-bold text-ink"
          >
            Sign up
          </a>
        </nav>
      </div>
    </>
  );
}
