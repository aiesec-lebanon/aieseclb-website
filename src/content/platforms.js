// PLATFORMS BUILT BY THE INFORMATION MANAGEMENT TEAM
//
// The first two entries are real: the sign-up portal (linked from the old site) and this website.
// Everything marked `sample: true` is a placeholder so the page can be designed. Those names and
// descriptions are NOT real products of AIESEC in Lebanon. Replace them with the platforms the
// team has actually built, then delete the `sample` flag.
//
// For each platform: drop a real screenshot in src/assets/gen/ named `<image>.png` or `.jpg`
// (16:10, at least 1600 px wide). Real screenshots, not generated ones. Until a screenshot
// exists the page draws a generic interface instead; `mock` picks which one:
// form | site | dashboard | board | calendar.

export const PLATFORMS = [
  {
    id: "signup",
    name: "Sign-up portal",
    url: "https://signup.aieseclb.org",
    kind: "For applicants",
    line: "The front door. One form that takes a student from curious to in the system.",
    points: ["One form for every programme", "Straight into the team's pipeline", "Works on a phone, because that is where people are"],
    stack: ["Web"],
    image: "platform-signup",
    mock: "form",
    tone: "day",
    sample: false,
  },
  {
    id: "website",
    name: "aieseclb.org",
    url: "/",
    kind: "For everyone",
    line: "The site you are on: built in-house, drawn in code, and maintained by the team.",
    points: ["React and Vite", "A real-time dawn rendered in a single shader", "Fast on a phone, usable without motion"],
    stack: ["React", "Vite", "WebGL"],
    image: "platform-website",
    mock: "site",
    tone: "dawn",
    sample: false,
  },
  {
    id: "sample-member-hub",
    name: "Member hub",
    url: null,
    kind: "For members",
    line: "Sample entry. Where a member would find their team, their tasks and their next training.",
    points: ["Sample point one", "Sample point two", "Sample point three"],
    stack: ["Sample"],
    image: "platform-member-hub",
    mock: "dashboard",
    tone: "night",
    sample: true,
  },
  {
    id: "sample-exchange-tracker",
    name: "Exchange tracker",
    url: null,
    kind: "For exchange teams",
    line: "Sample entry. One view of every person currently abroad or arriving, and what they need this week.",
    points: ["Sample point one", "Sample point two", "Sample point three"],
    stack: ["Sample"],
    image: "platform-exchange-tracker",
    mock: "board",
    tone: "teal",
    sample: true,
  },
  {
    id: "sample-events-desk",
    name: "Events desk",
    url: null,
    kind: "For organisers",
    line: "Sample entry. Registration, payment and check-in for conferences, without a spreadsheet.",
    points: ["Sample point one", "Sample point two", "Sample point three"],
    stack: ["Sample"],
    image: "platform-events-desk",
    mock: "calendar",
    tone: "ember",
    sample: true,
  },
];
