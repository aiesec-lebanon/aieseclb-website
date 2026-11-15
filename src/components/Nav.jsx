import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoWhite from "../assets/images/aiesec_logo_white.png";
import { NAV, SIGNUP_URL } from "../content/site";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  // the nav takes the scheme of whatever is under it: sections say data-scheme="light" when
  // they are light (the worlds on the events and platforms pages, for one)
  const [light, setLight] = useState(false);
  const lastY = useRef(0);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > 40);
      // step aside while reading down, come back on the way up
      setHidden(y > 500 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 500) setHidden(false);
      lastY.current = y;
      probe();
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
      later.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
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

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
          hidden && !open ? "-translate-y-[130%]" : "translate-y-0"
        }`}
      >
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
            <Link to="/" viewTransition aria-label="AIESEC in Lebanon, home" className="flex items-center gap-3">
              {/* the logo as a mask, so it can be white over dark worlds and AIESEC blue over light ones */}
              <span
                role="img"
                aria-label="AIESEC"
                className={`block aspect-[1265/259] h-[1.35rem] transition-colors duration-500 md:h-6 ${light ? "bg-aiesec" : "bg-white"}`}
                style={{ mask: `url(${logoWhite}) center / contain no-repeat`, WebkitMask: `url(${logoWhite}) center / contain no-repeat` }}
              />
              <span
                className={`hidden border-l pl-3 text-[0.95rem] font-bold transition-colors duration-500 sm:block ${
                  light ? "border-ink/20 text-ink/85" : "border-white/25 text-white/90"
                }`}
              >
                in Lebanon
              </span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  viewTransition
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-[0.98rem] font-bold transition-colors duration-300 ${
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
              <a
                href={SIGNUP_URL}
                className={`hidden items-center rounded-full bg-sun px-5 font-bold text-ink transition-[background-color,height] duration-300 hover:bg-white sm:inline-flex ${
                  compact ? "h-10" : "h-12"
                }`}
              >
                Sign up
              </a>
              <button
                type="button"
                className={`grid h-11 w-11 place-items-center rounded-full transition-colors duration-500 md:hidden ${
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
        className={`fixed inset-0 z-40 bg-night text-white transition-[clip-path,visibility] duration-700 ease-[var(--ease-in-out-quart)] md:hidden ${
          open ? "visible [clip-path:circle(150vmax_at_100%_0)]" : "invisible [clip-path:circle(0_at_100%_0)]"
        }`}
        inert={!open}
      >
        <nav aria-label="Mobile" className="shell flex h-full flex-col justify-center gap-2 pt-16">
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
          <a
            href={SIGNUP_URL}
            className="mt-8 inline-flex h-14 w-max items-center rounded-full bg-sun px-8 text-lg font-bold text-ink"
          >
            Sign up
          </a>
        </nav>
      </div>
    </>
  );
}
