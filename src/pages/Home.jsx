import React, { useEffect, useRef, useState } from "react";
import heroImage from "../assets/images/landing_page_bg.png";
import logo from "../assets/images/aiesec_logo.png";
import manImage from "../assets/images/aiesec_man.png";
import raoucheImage from "../assets/images/raouche.png";
import lauLogo from "../assets/images/lau_logo.png";
import aubLogo from "../assets/images/aub_logo.png";
import uniPicImage from "../assets/images/uni_pic.png";

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const Page = () => {
  const partners = [
    "DHL",
    "TCS",
    "Partner",
    "Electrolux",
    "Terrawind",
    "Schneider Electric",
    "SLB",
    "Partner",
    "Partner",
  ];

  const feedback = [
    "A terrific piece of praise",
    "A fantastic bit of feedback",
    "A genuinely glowing review",
  ];

  // ===== Scroll scene (Option A) =====
  const sceneRef = useRef(null);

  // This is the raw scroll progress (0 -> 1)
  const [progress, setProgress] = useState(0);

  // This is the SMOOTHED progress (0 -> 1)
  const [smoothProgress, setSmoothProgress] = useState(0);

  // refs for smooth animation loop
  const targetRef = useRef(0);
  const smoothRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const updateProgressFromScroll = () => {
      const el = sceneRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Pre-roll: start animating slightly before the section enters to overlap with hero
      const preRoll = vh * 1.0;

      // Scene is 200vh; include pre-roll so motion begins earlier
      const total = rect.height - vh + preRoll;
      const scrolled = -rect.top + preRoll;

      const p = total > 0 ? scrolled / total : 0;
      const clamped = clamp01(p);

      setProgress(clamped);
      targetRef.current = clamped;
    };

    const animate = () => {
      // lerp smoothing: current += (target - current) * factor
      // smaller factor = smoother but slower
      const factor = 0.07;

      const current = smoothRef.current;
      const target = targetRef.current;
      const next = current + (target - current) * factor;

      smoothRef.current = next;
      setSmoothProgress(next);

      rafRef.current = requestAnimationFrame(animate);
    };

    updateProgressFromScroll();
    window.addEventListener("scroll", updateProgressFromScroll, { passive: true });
    window.addEventListener("resize", updateProgressFromScroll);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", updateProgressFromScroll);
      window.removeEventListener("resize", updateProgressFromScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ===== Man movement based on smoothProgress =====
  // Start a bit early and stop to the right of the text
  const startX = 80; // px from left inside the scene
  const endX = 900; // final x so he sits a bit farther right of the text block
  const manProgress = clamp01(smoothProgress / 0.6); // cap movement, starts near 0
  const manX = startX + (endX - startX) * manProgress;

  // ===== Text reveal after some scroll (delayed relative to man) =====
  const textReveal = clamp01((smoothProgress - 0.1) / 0.4);
  const textOpacity = textReveal;
  const textTranslateY = 18 * (1 - textReveal);

  return (
    <div className="bg-[#edf6ff] w-full min-h-screen font-lato">
      {/* HERO AREA */}
      <section className="w-full bg-[#037ef3]">
        {/* Navbar */}
        <header className="w-full overflow-visible relative z-50">
          <div className="mx-auto max-w-[1440px] h-[80px] px-8 flex items-center justify-between overflow-visible">
            {/* LOGO */}
            <img src={logo} alt="AIESEC logo" className="h-[55px] w-auto" />

            {/* NAV */}
            <nav className="flex items-center gap-3 text-white text-[20px] leading-[32px]">
              {/* Home */}
              <a
                href="#"
                className="
                  px-5 py-2 rounded-lg
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  hover:bg-white/20
                  hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]
                "
              >
                Home
              </a>

              {/* Partners */}
              <a
                href="#"
                className="
                  px-5 py-2 rounded-lg
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  hover:bg-white/20
                  hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]
                "
              >
                Partners
              </a>

              {/* Sign up hover effect */}
              <a
                href="#"
                className="
                  px-5 py-2 rounded-lg
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  hover:bg-white
                  hover:text-[#000000]
                  hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                "
              >
                Sign up
              </a>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#037ef3] overflow-hidden pt-24 md:pt-32">
          <div className="mx-auto max-w-[1440px] h-full px-8 flex items-center">
            {/* LEFT TEXT */}
            <div className="z-10 max-w-[1100px] mt-[-100px]">
              <h1 className="font-handwriting text-[#ffc845] text-[185px] leading-[1.0] whitespace-nowrap drop-shadow-[6px_6px_0_rgba(0,0,0,0.3)]">
                Turn potential
                <br />
                <span className="inline-block">into impact</span>
              </h1>

              <p className="mt-8 text-white text-base sm:text-lg md:text-[22px] leading-8 max-w-[420px]">
                Build your potential through global exchange and volunteering
                projects in 110+ countries.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="absolute -bottom-12 -right-2">
              <img
                src={heroImage}
                alt="AIESEC youth"
                className="w-[1200px] max-w-none object-contain"
              />
            </div>
          </div>
        </section>
      </section>

      {/* ===== Scroll Scene: What is AIESEC (Option A) ===== */}
      <section ref={sceneRef} className="relative h-[200vh] bg-[#edf6ff]">
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen flex items-center">
          <div className="mx-auto max-w-[1440px] w-full px-8">
            <div className="relative w-full h-[520px] rounded-[40px] bg-[#edf6ff] overflow-visible">
              {/* TEXT (appears after scroll) */}
              <div
                className="absolute left-0 top-[-20px] max-w-[900px]"
                style={{
                  opacity: textOpacity,
                  transform: `translate3d(0, ${textTranslateY}px, 0)`,
                  transition: "opacity 450ms ease, transform 450ms ease",
                }}
              >
                <h2 className="font-handwriting text-black text-7xl sm:text-9xl md:text-[160px]">
                  What is Aiesec?
                </h2>

                <p className="mt-8 max-w-3xl text-[#828282] text-lg sm:text-2xl leading-7 sm:leading-9">
                  AIESEC is a global platform for young people to develop their
                  leadership potential through practical experiences of many
                  kinds, including internships, volunteering opportunities, and
                  more.
                  <br />
                  <br />
                  Founded in 1948, AIESEC is a non-governmental and not-for-profit
                  organization entirely run by youth for youth.
                </p>
              </div>

              {/* WALKING MAN IMAGE (moves smoothly with scroll) */}
              <img
                src={manImage}
                alt="Walking man"
                className="absolute bottom-24 w-[400px] h-auto select-none pointer-events-none"
                style={{
                  transform: `translate3d(${manX}px, 0, 0)`,
                  willChange: "transform",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="pt-4 pb-32 -mt-[320px] relative z-10">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-16 lg:gap-20">
            {/* Image - Left side (significantly larger) */}
            <div className="w-full lg:w-1/2 flex-shrink-0 flex justify-center lg:justify-start overflow-visible">
              <img
                src={raoucheImage}
                alt="Raouche, Beirut"
                className="w-full max-w-[900px] h-auto object-contain"
              />
            </div>

            {/* Text - Right side */}
            <div className="w-full lg:w-1/2 lg:-ml-8">
              <h2 className="font-handwriting text-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl drop-shadow leading-none whitespace-nowrap">
                Our story in Lebanon
              </h2>

              <p className="mt-8 text-[#828282] text-lg sm:text-2xl leading-7 sm:leading-9 max-w-[540px]">
                From the heart of Lebanon, we connect passionate youth with
                opportunities that create change across borders, cultures, and
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Universities */}
      <section className="pt-4 pb-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <h2 className="font-handwriting text-black text-8xl md:text-9xl drop-shadow text-center">
            Universities
          </h2>

          <div className="mt-8 mx-auto max-w-[920px] relative">
            {/* Blue rounded container */}
            <div className="relative bg-[#cfe7ff] border-[3px] border-[#0b63ff] rounded-[48px] h-[260px] flex items-center justify-center shadow-lg">
              {/* Decorative image - positioned absolutely */}
              <img
                src={uniPicImage}
                alt="Universities decorative"
                className="absolute right-[140px] top-[-120px] w-[260px] h-auto pointer-events-none select-none"
              />

              {/* Logo cards */}
              <div className="flex gap-12 items-center justify-center z-10">
                {/* LAU Logo Card */}
                <div className="bg-white rounded-[22px] w-[360px] h-[160px] flex items-center justify-center shadow-md">
                  <img
                    src={lauLogo}
                    alt="LAU Logo"
                    className="max-h-[160px] w-auto object-contain"
                  />
                </div>

                {/* AUB Logo Card */}
                <div className="bg-[#6B1B47] rounded-[22px] w-[360px] h-[160px] flex items-center justify-center shadow-md">
                  <img
                    src={aubLogo}
                    alt="AUB Logo"
                    className="max-h-[180px] w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore opportunities */}
      <section className="py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <h2 className="font-handwriting text-black text-6xl sm:text-8xl md:text-9xl drop-shadow text-center">
            Explore our opportunities
          </h2>

          <p className="mt-10 max-w-2xl text-[#828282] text-lg sm:text-[26px] leading-7 sm:leading-[39px]">
            Discover the experiences AIESEC offers: volunteer abroad through
            Global Volunteer, build your career with Global Talent, or teach and
            inspire through Global Teacher.
          </p>

          <div className="mt-10 inline-flex items-center gap-4 bg-[#037ef3] rounded-[20px] px-8 py-4">
            <span className="text-white text-2xl sm:text-3xl">
              View all Programs
            </span>
            <span className="text-white text-2xl">→</span>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <h2 className="font-handwriting text-black text-6xl sm:text-8xl md:text-9xl drop-shadow text-center">
            Our Partners
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((name, idx) => (
              <div
                key={`${name}-${idx}`}
                className="bg-white rounded-[20px] h-[90px] flex items-center justify-center text-xl"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <h2 className="font-handwriting text-black text-6xl sm:text-8xl md:text-9xl drop-shadow text-center">
            Feedback
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedback.map((txt, idx) => (
              <div
                key={`${idx}-${txt}`}
                className="bg-white rounded-xl border border-gray-200 p-8"
              >
                <p className="text-xl sm:text-2xl font-medium text-black">
                  “{txt}”
                </p>
                <div className="mt-8 text-[#828282]">Name • Description</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="w-full h-px bg-gray-200 mb-10" />

          <div className="flex flex-col md:flex-row gap-10 md:items-start md:justify-between">
            <div className="text-3xl font-bold">AIESEC</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-right sm:text-left">
              <div>
                <div className="text-black font-medium">Links</div>
                <div className="text-[#444444] mt-4">Page</div>
                <div className="text-[#444444] mt-2">Page</div>
              </div>

              <div>
                <div className="text-black font-medium">Contact us</div>
                <div className="text-[#444444] mt-4">Page</div>
                <div className="text-[#444444] mt-2">Page</div>
              </div>

              <div>
                <div className="text-black font-medium">Topic</div>
                <div className="text-[#444444] mt-4">Page</div>
                <div className="text-[#444444] mt-2">Page</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;

