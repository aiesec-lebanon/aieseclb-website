import React, { useEffect, useRef, useState } from "react";
import heroImage from "../assets/images/landing_page_bg.png";
import logo from "../assets/images/aiesec_logo.png";
import logoBlue from "../assets/images/aiesec_logo_blue.png";
import manImage from "../assets/images/aiesec_man.png";
import raoucheImage from "../assets/images/raouche.png";
import lauLogo from "../assets/images/lau_logo.png";
import aubLogo from "../assets/images/aub_logo.png";
import uniPicImage from "../assets/images/uni_pic.png";
import exploreOppsImage from "../assets/images/explore_opps.png";
import mapImage from "../assets/images/map.png";
import bubbleImage from "../assets/images/bubble.png";
import dhlLogo from "../assets/images/DHL_logo.png";
import electroluxLogo from "../assets/images/Electrolux_logo.png";
import schneiderLogo from "../assets/images/Shneider_logo.png";
import tcsLogo from "../assets/images/tcs_logo.png";
import terrawindLogo from "../assets/images/terrawind_logo.png";
import lorealLogo from "../assets/images/loreal_logo.png";
import henkelLogo from "../assets/images/Henkel_logo.png";
import pwcLogo from "../assets/images/pwc_logo.png";
import slbLogo from "../assets/images/slb_logo.png";
import person1 from "../assets/images/person1.png";
import person2 from "../assets/images/person2.png";
import person3 from "../assets/images/person3.png";
import fbLogo from "../assets/images/fb_logo.png";
import igLogo from "../assets/images/ig_logo.png";
import linkedinLogo from "../assets/images/linkedin_logo.png";
import ytLogo from "../assets/images/yt_logo.png";

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const Page = () => {
  const partnerLogos = [
    { src: dhlLogo, alt: "DHL" },
    { src: electroluxLogo, alt: "Electrolux" },
    { src: schneiderLogo, alt: "Schneider Electric" },
    { src: tcsLogo, alt: "TCS" },
    { src: terrawindLogo, alt: "Terrawind" },
    { src: lorealLogo, alt: "L'Oréal" },
    { src: henkelLogo, alt: "Henkel" },
    { src: pwcLogo, alt: "PwC" },
    { src: slbLogo, alt: "SLB" },
  ];

  const testimonials = [
    {
      quote: "A terrific piece of praise",
      name: "Sarah Johnson",
      role: "Global Volunteer",
      avatar: person1,
    },
    {
      quote: "A fantastic bit of feedback",
      name: "Michael Chen",
      role: "Global Talent",
      avatar: person2,
    },
    {
      quote: "A genuinely glowing review",
      name: "Emma Williams",
      role: "Global Teacher",
      avatar: person3,
    },
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
          <div className="mx-auto max-w-[1440px] h-[80px] px-4 md:px-8 flex items-center justify-between overflow-visible">
            {/* LOGO */}
            <img src={logo} alt="AIESEC logo" className="h-[45px] md:h-[55px] w-auto" />

            {/* Hamburger Menu (Mobile Only) */}
            <button className="md:hidden text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* NAV - Hidden on mobile, visible on desktop */}
            <nav className="hidden md:flex items-center gap-3 text-white text-[20px] leading-[32px]">
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
        <section className="relative w-full bg-[#037ef3] overflow-hidden py-8 sm:py-12 md:py-24">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              {/* LEFT TEXT */}
              <div className="z-10 w-full md:max-w-[1100px]">
                <h1 className="font-handwriting text-[#ffc845] text-5xl sm:text-6xl md:text-8xl lg:text-[185px] leading-tight md:leading-[1.0] drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] md:drop-shadow-[6px_6px_0_rgba(0,0,0,0.3)]">
                  Turn potential
                  <br />
                  <span className="inline-block">into impact</span>
                </h1>

                <p className="mt-4 md:mt-8 text-white text-base sm:text-lg md:text-[22px] leading-7 md:leading-8 max-w-[420px]">
                  Build your potential through global exchange and volunteering
                  projects in 110+ countries.
                </p>
              </div>

              {/* RIGHT IMAGE */}
              <div className="w-full md:absolute md:-bottom-12 md:-right-2 flex justify-center md:justify-end">
                <img
                  src={heroImage}
                  alt="AIESEC youth"
                  className="w-full max-w-[360px] sm:max-w-[420px] md:w-[1200px] md:max-w-none object-contain"
                />
              </div>
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
      <section className="pt-0 pb-24 -mt-20">
        <div className="mx-auto max-w-[1440px] px-8">
          <h2 className="font-handwriting text-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl drop-shadow text-center">
            Universities
          </h2>

          <div className="mt-6 mx-auto max-w-[1020px] relative">
            {/* Blue rounded container */}
            <div className="relative bg-[#cfe7ff] border-[3px] border-[#0b63ff] rounded-[48px] h-[360px] flex items-center justify-center shadow-lg">
              {/* Decorative image - positioned absolutely */}
              <img
                src={uniPicImage}
                alt="Universities decorative"
                className="absolute right-[-60px] top-[-165px] w-[410px] h-auto pointer-events-none select-none"
              />

              {/* Logo cards */}
              <div className="flex gap-14 items-center justify-center z-10">
                {/* LAU Logo Card */}
                <div className="bg-white rounded-[22px] w-[440px] h-[200px] flex items-center justify-center shadow-none">
                  <img
                    src={lauLogo}
                    alt="LAU Logo"
                    className="max-h-[200px] w-auto object-contain"
                  />
                </div>

                {/* AUB Logo Card */}
                <div className="bg-[#6B1B47] rounded-[22px] w-[440px] h-[200px] flex items-center justify-center shadow-none">
                  <img
                    src={aubLogo}
                    alt="AUB Logo"
                    className="max-h-[220px] w-auto object-contain"
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
          {/* Centered title */}
          <h2 className="mt-8 font-handwriting text-black text-6xl sm:text-8xl md:text-9xl drop-shadow text-center">
            Explore our opportunities
          </h2>

          {/* Two-column grid below title */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left column: Description and Button */}
            <div className="-translate-y-4 md:-translate-y-20">
              <p className="text-[#828282] text-lg sm:text-[26px] leading-7 sm:leading-[39px]">
                Discover the experiences AIESEC offers: volunteer abroad through Global Volunteer, build your career with Global Talent, or teach and inspire through Global Teacher.
              </p>

              <button
                type="button"
                className="mt-10 inline-flex items-center gap-4 bg-[#037ef3] rounded-[20px] px-8 py-4 text-white text-2xl sm:text-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span>View all Programs</span>
                <span className="text-2xl">→</span>
              </button>
            </div>

            {/* Right column: Image */}
            <div className="flex justify-center items-center -translate-y-4 md:-translate-y-8">
              <img
                src={exploreOppsImage}
                alt="Explore opportunities"
                className="w-full max-w-[550px] h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 bg-[#edf6ff]">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="relative mt-12">
            {/* Background map covering title + grid */}
            <div className="absolute inset-0 opacity-80 translate-y-4 pointer-events-none select-none">
              <img
                src={mapImage}
                alt="World map"
                className="w-full h-full object-contain object-top"
              />
            </div>

            <h2 className="relative z-10 font-handwriting text-black text-6xl sm:text-8xl md:text-9xl drop-shadow text-center">
              Our Partners
            </h2>

            {/* Logo grid */}
            <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerLogos.map((logo, idx) => (
                <div
                  key={`${logo.alt}-${idx}`}
                  className="bg-white rounded-[22px] px-8 py-5 flex items-center justify-center shadow-sm"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="w-full max-w-[240px] max-h-[80px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="flex items-center justify-center gap-4">
            {/* Chat bubble with sparkle */}
            <div className="relative">
              <img
                src={bubbleImage}
                alt="Chat bubble"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
              />
              {/* Yellow sparkle star */}
              <svg
                className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="#FFC845"
                />
              </svg>
            </div>
            <h2 className="font-handwriting text-black text-6xl sm:text-8xl md:text-9xl drop-shadow">
              Feedback
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={`${idx}-${testimonial.name}`}
                className="bg-white rounded-xl border border-gray-200 p-8"
              >
                <p className="text-xl sm:text-2xl font-medium text-black">
                  "{testimonial.quote}"
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-black font-medium">{testimonial.name}</div>
                    <div className="text-[#828282] text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-4">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="flex flex-col md:flex-row gap-10 md:items-start md:justify-between">
            <div className="flex flex-col gap-0">
              <img src={logoBlue} alt="AIESEC logo" className="h-[115px] w-auto" />
              <div className="flex items-center gap-4 -mt-2">
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={fbLogo} alt="Facebook" className="w-11 h-11 object-contain" />
                </a>
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={igLogo} alt="Instagram" className="w-11 h-11 object-contain" />
                </a>
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={linkedinLogo} alt="LinkedIn" className="w-11 h-11 object-contain" />
                </a>
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={ytLogo} alt="YouTube" className="w-11 h-11 object-contain" />
                </a>
              </div>
            </div>

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

