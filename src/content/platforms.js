// PLATFORMS BUILT BY AIESEC IN LEBANON
//
// Written from the projects themselves (their READMEs and screens) in the projects folder next to
// this website. Each platform is a world on the platforms page (src/components/World.jsx), made
// from the platform's own design: its colours, its type, the things it is about.
//
// Pictures (src/assets/gen/, made by cook/tools/compose.mjs from the platforms running locally):
//   image   `platform-<id>.jpg`         the platform on a laptop and a phone, in its world
//   screen  `platform-<id>-screen.jpg`  one screen, flat, for the browser windows in the page's hero
// Until a picture exists the page draws a generic interface instead (`mock`: form, site,
// dashboard, board, calendar).
//
// `layout` gives a world its own composition: split (the default, side by side), stage (centred),
// wide (picture across the page, text beneath), overlap (text on a card over the picture).
//
// `url` is where "Open it" goes; `cta` changes its label. Tools that need an AIESEC account have
// no url. Check the lines before going live: they describe what each README says the platform
// does, not usage numbers or launch dates, which are not known here.

export const PLATFORMS = [
  {
    id: "signup",
    name: "Sign-up portal",
    url: "https://signup.aieseclb.org",
    kind: "For applicants",
    line: "The front door for going abroad. Pick Global Volunteer, Teacher or Talent, fill in one form, and you are in AIESEC's global system.",
    points: [
      "A page for each programme: volunteer, teach, work",
      "Signs you up to AIESEC's global platform directly",
      "A template other AIESEC countries can reuse",
    ],
    stack: ["Next.js", "React", "TypeScript"],
    image: "platform-signup",
    screen: "platform-signup-screen",
    mock: "form",
    tone: "day",
    world: {
      scheme: "dark", bg: "#0a5fc4", ink: "#ffffff", soft: "#d6e8ff", accent: "#ffc845", accentInk: "#ffe08f", line: "#3a82d6", card: "#0b55b0",
      scenery: "door", font: "site", frame: "window",
    },
  },
  {
    id: "member-portal",
    name: "Membership portal",
    url: null,
    kind: "For new members",
    line: "Where a student becomes a member: what the experience is, and one application to join.",
    points: ["What membership is, in pictures", "One application form", "In development"],
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    image: "platform-member-portal",
    screen: "platform-member-portal-screen",
    mock: "site",
    tone: "night",
    world: {
      scheme: "dark", bg: "#15120e", ink: "#fffaf2", soft: "#c9c0b2", accent: "#ffc845", accentInk: "#ffd36b", line: "#322a20", card: "#1f1a14",
      scenery: "ascent", font: "site", frame: "window",
    },
  },
  {
    id: "partner-portal",
    layout: "overlap",
    name: "Partner Portal",
    url: null,
    kind: "For partners",
    line: "Where organisations partner with AIESEC in Lebanon: a page of their own, and every promised deliverable tracked with proof they accept.",
    points: [
      "A partner-with-us form that reaches the right person",
      "A public showcase page for every partner",
      "Deliverables with proof, reviewed by the partner",
    ],
    stack: ["Next.js", "PostgreSQL", "Auth.js"],
    image: "platform-partner-portal",
    screen: "platform-partner-portal-screen",
    mock: "dashboard",
    tone: "night",
    world: {
      // its dark theme
      scheme: "dark", bg: "#11141a", ink: "#f5f5f5", soft: "#aab1bd", accent: "#037ef3", accentInk: "#5aa9ff", line: "#262b35", card: "#1a1e26",
      scenery: "showcase", font: "site", frame: "window",
    },
  },
  {
    id: "xp",
    layout: "stage",
    name: "AIESEC XP",
    url: null,
    kind: "For members",
    line: "Exchange work as a game. Every step an exchange takes in AIESEC's global system becomes points, ranks and rewards.",
    points: [
      "Leaderboards for members and for local committees",
      "Rewards, each on its own road",
      "A 3D character for every member, and a TV mode for the office",
    ],
    stack: ["Next.js", "three.js", "PostgreSQL"],
    image: "platform-xp",
    screen: "platform-xp-screen",
    mock: "board",
    tone: "day",
    world: {
      // its studio set: warm wall and floor, the four colours of the exchange funnel
      scheme: "light", bg: "#fbfaf8", ink: "#171614", soft: "#4a4842", accent: "#037ef3", accentInk: "#0b5cb8", line: "#e3dfd7", card: "#ffffff",
      scenery: "studio", font: "rounded", frame: "window",
    },
  },
  {
    id: "forms",
    name: "AIESEC Forms",
    url: "https://github.com/aiesec-lebanon/form-builder",
    cta: "See the code",
    kind: "For every team",
    line: "A form builder that keeps the form, not the answers. Responses go straight to your own Google Sheet, webhook or database.",
    points: [
      "Sign in with your AIESEC account",
      "Survives the handover at the end of every term",
      "Open source, for any AIESEC entity",
    ],
    stack: ["Next.js", "PostgreSQL", "Google Sheets"],
    image: "platform-forms",
    screen: "platform-forms-screen",
    mock: "form",
    tone: "day",
    world: {
      scheme: "light", bg: "#f4f6f9", ink: "#11141a", soft: "#4a5160", accent: "#037ef3", accentInk: "#0063c1", line: "#d9dee6", card: "#ffffff",
      scenery: "paper", font: "site", frame: "window",
    },
  },
  {
    id: "pulse",
    layout: "wide",
    name: "AIESEC Pulse",
    url: null,
    kind: "For the network",
    line: "News for the AIESEC network. Entity leaders publish, members read and react, and every update reaches the people it is meant for.",
    points: [
      "Follows the real office tree, not one global feed",
      "Moderators approve before anything goes out",
      "Reactions, comments and bookmarks",
    ],
    stack: ["Next.js", "PostgreSQL", "Tiptap"],
    image: "platform-pulse",
    screen: "platform-pulse-screen",
    mock: "dashboard",
    tone: "night",
    world: {
      scheme: "dark", bg: "#0b0e13", ink: "#f5f5f5", soft: "#a9b0bb", accent: "#5aa9ff", accentInk: "#7dbbff", line: "#232833", card: "#141922",
      scenery: "newsroom", font: "serif", frame: "window",
    },
  },
  {
    id: "learn-git",
    name: "Learn Git",
    url: null,
    kind: "For members, and anyone",
    line: "Git and GitHub, taught at a whiteboard. Every command you run in the browser is drawn as it happens and explained in plain words.",
    points: [
      "A sandbox in the browser, nothing to install",
      "From a first commit to rescuing a broken history",
      "Free, no account, nothing leaves your browser",
    ],
    stack: ["Next.js", "TypeScript", "MDX"],
    image: "platform-learn-git",
    screen: "platform-learn-git-screen",
    mock: "site",
    tone: "day",
    world: {
      // its "Office Hours" theme: the board, black marker, AIESEC blue, sticky notes
      scheme: "light", bg: "#fafbfc", ink: "#1b1d22", soft: "#4b515a", accent: "#037ef3", accentInk: "#0266cc", line: "#d8dce2", card: "#ffffff",
      scenery: "whiteboard", font: "marker", frame: "window",
    },
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
    screen: "platform-website-screen",
    mock: "site",
    tone: "dawn",
    world: {
      scheme: "dark", bg: "#030b1c", ink: "#ffffff", soft: "#a9b8d6", accent: "#ffc845", accentInk: "#ffd36b", line: "#13254a", card: "#06142e",
      scenery: "dawn", font: "site", frame: "window",
    },
  },
];
