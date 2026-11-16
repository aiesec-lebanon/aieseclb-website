// Facts on this page come from the previous version of the site. Change them here, in one place.

export const SIGNUP_URL = "https://signup.aieseclb.org";

export const NAV = [
  { to: "/lebanon", label: "Lebanon" },
  { to: "/exchange", label: "Exchange" },
  { to: "/events", label: "Events" },
  { to: "/platforms", label: "Platforms" },
  { to: "/stories", label: "Stories" },
];

// The two platforms that stakeholders come to this website for, besides sign-up: partners and
// students who want to become members. In the header and the footer.
// `url` is the live address. Until it is set, the link opens the platform's section on /platforms.
// TODO: set both urls when the portals are live.
export const PORTALS = [
  { id: "partner-portal", label: "Partners", long: "Partner portal", url: null },
  { id: "member-portal", label: "Membership", long: "Membership portal", url: null },
];
export const portalHref = (p) => p.url || `/platforms#${p.id}`;

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/aiesecinleb" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aiesec-in-lebanon/" },
  { label: "YouTube", href: "https://youtube.com/@aiesecinleb" },
];

export const FOUNDED_GLOBAL = 1948;
export const FOUNDED_LEBANON = 2011;

export const STATS = [
  { value: 40000, suffix: "+", label: "members worldwide" },
  { value: 100, suffix: "+", label: "countries and territories" },
  { value: 30000, suffix: "+", label: "experiences every year" },
  { value: 1000000, suffix: "+", label: "alumni across the globe" },
];

export const UNIVERSITIES = [
  { name: "Lebanese American University", short: "LAU", logo: "lau_logo.png", dark: false },
  { name: "American University of Beirut", short: "AUB", logo: "aub_logo.png", dark: true },
];

export const PARTNERS = [
  { name: "DHL", logo: "DHL_logo.png" },
  { name: "Electrolux", logo: "Electrolux_logo.png" },
  { name: "Schneider Electric", logo: "Shneider_logo.png" },
  { name: "TCS", logo: "tcs_logo.png" },
  { name: "Terrawind", logo: "terrawind_logo.png" },
  { name: "L'Oréal", logo: "loreal_logo.png" },
  { name: "Henkel", logo: "Henkel_logo.png" },
  { name: "PwC", logo: "pwc_logo.png" },
  { name: "SLB", logo: "slb_logo.png" },
];

export const PROGRAMS = [
  {
    id: "volunteer",
    name: "Global Volunteer",
    color: "ember",
    verb: "Volunteer",
    line: "Give a few weeks. Come home changed.",
    body: "Join a volunteering project abroad built around the Sustainable Development Goals, with a team of young people from all over the world.",
    image: "program-volunteer",
  },
  {
    id: "talent",
    name: "Global Talent",
    color: "teal",
    verb: "Intern",
    line: "Start your career somewhere new.",
    body: "Take an internship abroad with a company or a startup, and learn to work in a culture that is not your own.",
    image: "program-talent",
  },
  {
    id: "teacher",
    name: "Global Teacher",
    color: "tangerine",
    verb: "Teach",
    line: "Stand in front of a class a world away.",
    body: "Teach abroad, share what you know, and discover how much a classroom can teach you back.",
    image: "program-teacher",
  },
];
