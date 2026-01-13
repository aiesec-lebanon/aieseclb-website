import React, { useEffect, useRef, useState } from "react";
import heroImage from "../assets/images/landing_page_bg.png";
import logo from "../assets/images/aiesec_logo.png";
import logoBlue from "../assets/images/aiesec_logo_blue.png";
import manImage from "../assets/images/aiesec_man.png";
import raoucheImage from "../assets/images/raouche.png";
import lauLogo from "../assets/images/lau_logo.png";
import aubLogo from "../assets/images/aub_logo.png";
import uniPicImage from "../assets/images/uni_pic.png";
import earthLogo from "../assets/images/earth_logo.png";
import teacherLogo from "../assets/images/teacher_logo.png";
import capLogo from "../assets/images/cap_logo.png";
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

  // Mobile nav
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileManX, setMobileManX] = useState(-100);

  // ===== Scroll scene (desktop only) =====
  const sceneRef = useRef(null);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const targetRef = useRef(0);
  const smoothRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const updateProgressFromScroll = () => {
      if (window.innerWidth >= 768) {
        // Desktop scroll logic

        const el = sceneRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;

        const preRoll = vh * 1.0;
        const total = rect.height - vh + preRoll;
        const scrolled = -rect.top + preRoll;

        const p = total > 0 ? scrolled / total : 0;
        targetRef.current = clamp01(p);
      } else {
        // Mobile scroll logic - move man from left to center based on scroll
        const scrollY = window.scrollY;
        const maxScroll = 1200; // Adjust based on when you want movement to complete
        const progress = Math.min(scrollY / maxScroll, 1);
        const startOffset = -100; // Start from left edge
        const endOffset = 0; // End at center
        setMobileManX(startOffset + (endOffset - startOffset) * progress);
      }
    };

    const animate = () => {
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

  const startX = 80;
  const endX = 900;
  const manProgress = clamp01(smoothProgress / 0.6);
  const manX = startX + (endX - startX) * manProgress;

  const textReveal = clamp01((smoothProgress - 0.1) / 0.4);
  const textOpacity = textReveal;
  const textTranslateY = 18 * (1 - textReveal);

  return (
    <>
      <style>{`
        @keyframes circularOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes counterRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        .orbit-container {
          animation: circularOrbit 12s linear infinite;
        }

        .orbit-icon {
          animation: counterRotate 12s linear infinite;
        }

        @media (min-width: 768px) {
          .orbit-container:hover {
            animation-play-state: paused;
          }
          .orbit-container:hover .orbit-icon {
            animation-play-state: paused;
          }
        }
      `}</style>
      <div className="bg-[#edf6ff] w-full min-h-screen font-lato overflow-x-hidden">
      {/* HERO AREA */}
      <section className="w-full bg-[#037ef3]">
        {/* Navbar */}
        <header className="w-full overflow-visible relative z-50">
          <div className="mx-auto max-w-[1440px] h-[72px] md:h-[80px] px-4 md:px-8 flex items-center justify-between overflow-visible">
            <img src={logo} alt="AIESEC logo" className="h-[40px] md:h-[55px] w-auto" />

            {/* Hamburger (Mobile) */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-3 text-white text-[20px] leading-[32px]">
              <a
                href="#"
                className="px-5 py-2 rounded-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/20 hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
              >
                Home
              </a>
              <a
                href="#partners"
                className="px-5 py-2 rounded-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/20 hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
              >
                Partners
              </a>
              <a
                href="#"
                className="px-5 py-2 rounded-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white hover:text-[#000000] hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
              >
                Sign up
              </a>
            </nav>
          </div>

          {/* Mobile dropdown */}
          <div className={`md:hidden px-4 pb-4 transition-all duration-200 ${menuOpen ? "block" : "hidden"}`}>
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-3">
              <a
                href="#"
                className="block rounded-xl px-4 py-3 text-white text-lg hover:bg-white/15"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#partners"
                className="block rounded-xl px-4 py-3 text-white text-lg hover:bg-white/15"
                onClick={() => setMenuOpen(false)}
              >
                Partners
              </a>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="relative w-full bg-[#037ef3] overflow-hidden py-8 sm:py-12 md:py-32">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              {/* LEFT TEXT */}
              <div className="z-10 w-full md:max-w-[1100px] text-center md:text-left">
                {/* Bigger title ONLY on mobile */}
                <h1 className="font-handwriting text-[#ffc845] text-[78px] leading-[1.02] sm:text-6xl md:text-8xl lg:text-[185px] md:leading-[1.0] drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] md:drop-shadow-[6px_6px_0_rgba(0,0,0,0.3)]">
                  Turn potential
                  <br />
                  <span className="inline-block">into impact</span>
                </h1>

                <p className="mt-4 md:mt-8 text-white text-left text-base sm:text-lg md:text-[22px] leading-7 md:leading-8 max-w-[320px] md:max-w-[520px] ml-10 md:ml-0">
                  Build your potential through global exchange and volunteering projects in 110+ countries.
                </p>

                {/* CTA on mobile */}
                <div className="mt-6 md:hidden flex justify-center mb-0">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center bg-[#ffc845] text-black font-semibold rounded-full px-10 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.25)] active:scale-[0.98]"
                  >
                    Sign up
                  </a>
                </div>
              </div>

              {/* mobile image*/}
              <div className="md:hidden w-full -mt-8">
                <div className="relative h-[450px] w-[450px] -translate-x-[30px] overflow-hidden">

                  <img
                    src={heroImage}
                    alt="AIESEC youth"
                    className="absolute left-1/2 top-1/2 max-w-none"
                            style={{
                              width: "170%",
                              transform: "translate(-65%, -50%)",
                            }}
                  />
                </div>
              </div>

              {/* ✅ DESKTOP IMAGE ONLY (ORIGINAL desktop – untouched) */}
              <div className="hidden md:flex w-full md:absolute md:-bottom-12 md:-right-2 justify-center md:justify-end">
                <img
                  src={heroImage}
                  alt="AIESEC youth"
                  className="w-full max-w-[420px] sm:max-w-[520px] md:w-[1200px] md:max-w-none object-contain"
                />
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Mobile simple version */}
      <section className="md:hidden py-16">
        <div className="mx-auto max-w-[1440px] px-4">
          <h2 className="font-handwriting text-black text-6xl drop-shadow pb-2">What is Aiesec?</h2>
          <p className="mt-2 text-[#828282] text-base leading-7">
            AIESEC is a global platform for young people to develop their leadership potential through practical
            experiences of many kinds, including internships, volunteering opportunities, and more.
            <br />
            <br />
            Founded in 1948, AIESEC is a non-governmental and not-for-profit organization entirely run by youth for
            youth.
          </p>
          <div className="mt-0 flex justify-center overflow-visible">
            <img 
              src={manImage} 
              alt="Walking man" 
              className="w-[200px] h-auto" 
              style={{ transform: `translateX(${mobileManX}px)`, transition: 'transform 0.1s cubic-bezier(0, 0, 0, 1)' }}
            />
          </div>
        </div>
      </section>

      {/* Desktop animated scroll scene */}
      <section ref={sceneRef} className="hidden md:block relative h-[200vh] bg-[#edf6ff]">
        <div className="sticky top-0 h-screen flex items-center">
          <div className="mx-auto max-w-[1440px] w-full px-8">
            <div className="relative w-full h-[520px] rounded-[40px] bg-[#edf6ff] overflow-visible">
              <div
                className="absolute left-0 top-[-20px] max-w-[900px]"
                style={{
                  opacity: textOpacity,
                  transform: `translate3d(0, ${textTranslateY}px, 0)`,
                  transition: "opacity 450ms ease, transform 450ms ease",
                }}
              >
                <h2 className="font-handwriting text-black text-[160px]">What is Aiesec?</h2>
                <p className="mt--5 max-w-3xl text-[#828282] text-2xl leading-9">
                  AIESEC is a global platform for young people to develop their leadership potential through practical
                  experiences of many kinds, including internships, volunteering opportunities, and more.
                  <br />
                  <br />
                  Founded in 1948, AIESEC is a non-governmental and not-for-profit organization entirely run by youth
                  for youth.
                </p>
              </div>

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
      <section className="pt-4 pb-24 md:pb-22 md:-mt-[1100px] relative z-10">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-0 lg:gap-20">
            <div className="w-full lg:w-1/2 flex-shrink-0 flex justify-end lg:justify-start overflow-visible order-2 lg:order-1 -mt-19 lg:mt-0">
              <img src={raoucheImage} alt="Raouche, Beirut" className="w-full max-w-[300px] lg:max-w-[900px] h-auto object-contain" />
            </div>

            <div className="w-full lg:w-1/2 lg:-ml-8 order-1 lg:order-2">
              <h2 className="font-handwriting text-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl drop-shadow leading-none">
                Our story in Lebanon
              </h2>

              <p className="mt-4 md:mt-8 text-[#828282] text-base sm:text-xl md:text-2xl leading-7 sm:leading-9 max-w-[540px]">
                From the heart of Lebanon, we connect passionate youth with opportunities that create change across
                borders, cultures, and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Universities */}
      <section className="pt-0 pb-20 md:pb-24 -mt-10 md:-mt-20">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <h2 className="font-handwriting text-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl drop-shadow text-center">
            Universities
          </h2>

          <div className="mt-6 mx-auto max-w-[1020px] relative">
            <div className="relative bg-[#cfe7ff] border-[3px] border-[#0b63ff] rounded-[32px] md:rounded-[48px] p-6 md:p-0 md:h-[360px] flex items-center justify-center shadow-lg">
              <img
                src={uniPicImage}
                alt="Universities decorative"
                className="hidden md:block absolute right-[-60px] top-[-165px] w-[410px] h-auto pointer-events-none select-none"
              />

              <div className="flex flex-col md:flex-row gap-6 md:gap-14 items-stretch md:items-center justify-center z-10 w-full">
                <div className="bg-white rounded-[22px] w-full md:w-[440px] h-[160px] md:h-[200px] flex items-center justify-center">
                  <img src={lauLogo} alt="LAU Logo" className="max-h-[140px] md:max-h-[200px] w-auto object-contain" />
                </div>

                <div className="bg-[#6B1B47] rounded-[22px] w-full md:w-[440px] h-[160px] md:h-[200px] flex items-center justify-center">
                  <img src={aubLogo} alt="AUB Logo" className="max-h-[150px] md:max-h-[220px] w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore opportunities */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <h2 className="mt-4 md:mt-8 font-handwriting text-black text-5xl sm:text-7xl md:text-9xl drop-shadow text-center">
            Explore our opportunities
          </h2>

          <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="md:-translate-y-12">
              <p className="text-[#828282] text-base sm:text-xl md:text-[26px] leading-7 sm:leading-9 md:leading-[39px] -mt-5 md:mt-0">
                Discover the experiences AIESEC offers: volunteer abroad through Global Volunteer, build your career
                with Global Talent, or teach and inspire through Global Teacher.
              </p>

              <button
                type="button"
                className="mt-12 md:mt-10 inline-flex items-center gap-1 md:gap-4 bg-[#037ef3] rounded-[18px] md:rounded-[20px] px-3 py-3 sm:px-6 sm:py-4 md:px-8 text-white text-base sm:text-xl md:text-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span>View all Programs</span>
                <span className="text-xl md:text-2xl">→</span>
              </button>
            </div>

            <div className="flex justify-center items-center -mt-32 md:mt-0 md:translate-y-0 translate-x-24 md:-translate-x-6">
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-96 md:h-96 orbit-container">
                {/* Top icon */}
                <img
                  src={earthLogo}
                  alt="Global Volunteer"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 object-contain orbit-icon"
                />
                {/* Bottom-left icon */}
                <img
                  src={capLogo}
                  alt="Global Talent"
                  className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 object-contain orbit-icon"
                />
                {/* Bottom-right icon */}
                <img
                  src={teacherLogo}
                  alt="Global Teacher"
                  className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 object-contain orbit-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-20 md:py-24 bg-[#edf6ff]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="relative mt-8 md:mt-12">
            <div className="absolute inset-0 opacity-80 translate-y-4 pointer-events-none select-none">
              <img src={mapImage} alt="World map" className="w-full h-full object-contain object-top" />
            </div>

            <h2 className="relative z-10 font-handwriting text-black text-5xl sm:text-7xl md:text-9xl drop-shadow text-center">
              Our Partners
            </h2>

            <div className="relative z-10 mt-10 md:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {partnerLogos.map((lg, idx) => (
                <div
                  key={`${lg.alt}-${idx}`}
                  className={`bg-white rounded-[18px] md:rounded-[22px] px-4 md:px-8 py-4 md:py-5 flex items-center justify-center shadow-sm ${
                    idx === partnerLogos.length - 1 ? 'col-span-2 sm:col-span-1 justify-self-center w-full max-w-[calc(50%-0.5rem)] sm:max-w-none' : ''
                  }`}
                >
                  <img 
                    src={lg.src} 
                    alt={lg.alt} 
                    className={`w-full max-h-[60px] md:max-h-[80px] object-contain ${
                      lg.alt === 'DHL' ? 'max-w-[140px] md:max-w-[200px]' : 'max-w-[180px] md:max-w-[240px]'
                    }`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <img src={bubbleImage} alt="Chat bubble" className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />
              <svg className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#FFC845" />
              </svg>
            </div>
            <h2 className="font-handwriting text-black text-5xl sm:text-7xl md:text-9xl drop-shadow">Testimonials</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t, idx) => (
              <div key={`${idx}-${t.name}`} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-black">"{t.quote}"</p>
                <div className="mt-6 md:mt-8 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover" />
                  <div>
                    <div className="text-black font-medium">{t.name}</div>
                    <div className="text-[#828282] text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:items-start md:justify-between">
            <div className="flex flex-col gap-0">
              <img src={logoBlue} alt="AIESEC logo" className="h-[95px] md:h-[115px] w-auto max-w-[200px] md:max-w-none" />
              <div className="flex items-center gap-4 -mt-2">
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={fbLogo} alt="Facebook" className="w-10 h-10 md:w-11 md:h-11 object-contain" />
                </a>
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={igLogo} alt="Instagram" className="w-10 h-10 md:w-11 md:h-11 object-contain" />
                </a>
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={linkedinLogo} alt="LinkedIn" className="w-10 h-10 md:w-11 md:h-11 object-contain" />
                </a>
                <a href="#" className="transition-all opacity-90 hover:opacity-100 hover:scale-110">
                  <img src={ytLogo} alt="YouTube" className="w-10 h-10 md:w-11 md:h-11 object-contain" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
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

              <div className="col-span-2 sm:col-span-1">
                <div className="text-black font-medium">Topic</div>
                <div className="text-[#444444] mt-4">Page</div>
                <div className="text-[#444444] mt-2">Page</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Page;
