// EVENTS SHOWCASE
//
// SAMPLE CONTENT. Every entry marked `sample: true` is a placeholder written so the page can be
// designed. The event types are real AIESEC formats, but the descriptions, seasons and numbers
// are NOT facts about AIESEC in Lebanon. Replace them with real events before this goes live,
// then delete the `sample` flag. A banner on the page reminds you while you are developing.
//
// For each event: drop a photo in src/assets/gen/ named `<image>.jpg` (see README there).
// Until it exists, `stand` names one of the photographs already there to stand in for it.
//
// `world` is the world the event becomes on the events page (see src/components/World.jsx):
// its colours, its set (scenery), what is in the air (weather), the type of its heading (font)
// and how its photograph is mounted (frame: plain, gold, polaroid, taped, bezel, mat).

export const EVENTS = [
  {
    id: "national-conference",
    world: {
      // a gala night: navy and gold, chandelier light, a serif for the occasion
      scheme: "dark", bg: "#0b0e26", ink: "#fbf4e4", soft: "#cdc2a4", accent: "#ffc845", accentInk: "#ffd36b", line: "#2c2f52", card: "#141838",
      scenery: "gala", weather: { kind: "bokeh", density: 1 }, font: "serif", frame: "gold",
    },
    name: "National Conference",
    kind: "Conference",
    when: "Season to be confirmed",
    where: "Lebanon",
    line: "Every member in one room for a weekend: strategy by day, a gala by night.",
    image: "event-national-conference",
    stand: "events-cover", // shown until event-national-conference.jpg exists
    tone: "night",
    sample: true,
  },
  {
    id: "youth-speak-forum",
    world: {
      // a stage: near-black, coral light, spotlights and haze
      scheme: "dark", bg: "#150907", ink: "#fff2ec", soft: "#d8b2a5", accent: "#f85a40", accentInk: "#ff8f78", line: "#3b201a", card: "#24110d",
      scenery: "stage", weather: { kind: "dust", density: 0.7 }, font: "site", frame: "bezel",
    },
    name: "Youth Speak Forum",
    kind: "Forum",
    when: "Season to be confirmed",
    where: "Beirut",
    line: "Students, companies and civil society at one table, working on what young people in Lebanon actually need.",
    image: "event-youth-speak-forum",
    stand: "program-talent", // shown until event-youth-speak-forum.jpg exists
    tone: "ember",
    sample: true,
  },
  {
    id: "global-village",
    world: {
      // a market of the world: warm paper, bunting, steam from the tables
      scheme: "light", bg: "#fcefdf", ink: "#2b1608", soft: "#6b4529", accent: "#f48924", accentInk: "#9c4a06", line: "#ecd3b4", card: "#fff8ee",
      scenery: "village", weather: { kind: "steam", density: 0.8 }, font: "rounded", frame: "polaroid",
    },
    name: "Global Village",
    kind: "Cultural night",
    when: "Season to be confirmed",
    where: "Beirut",
    line: "Every exchange participant in the country sets up a table from home. You eat your way around the world in one evening.",
    image: "event-global-village",
    stand: "day-mezze", // shown until event-global-village.jpg exists
    tone: "tangerine",
    sample: true,
  },
  {
    id: "leadership-summit",
    world: {
      // the mountains in winter: pine dark, cold light, snow on the wind
      scheme: "dark", bg: "#0b1d18", ink: "#eef5f1", soft: "#a7c1b6", accent: "#5fd39b", accentInk: "#84e2b4", line: "#23403a", card: "#10271f",
      scenery: "mountain", weather: { kind: "snow", density: 1, wind: 0.8 }, font: "site", frame: "mat",
    },
    name: "Leadership Development Days",
    kind: "Training",
    when: "Season to be confirmed",
    where: "Mount Lebanon",
    line: "New team leaders spend three days in the mountains learning to run a team before they are handed one.",
    image: "event-leadership-days",
    stand: "lebanon-cedars", // shown until event-leadership-days.jpg exists
    tone: "cedar",
    sample: true,
  },
  {
    id: "open-day",
    world: {
      // a campus morning: sky, sun through the trees, leaves on the breeze
      scheme: "light", bg: "#e8f2ff", ink: "#0a1a33", soft: "#3b5376", accent: "#037ef3", accentInk: "#0060bd", line: "#c6daf2", card: "#ffffff",
      scenery: "campus", weather: { kind: "leaves", density: 0.6, wind: 0.4 }, font: "rounded", frame: "polaroid",
    },
    name: "Recruitment Open Day",
    kind: "On campus",
    when: "Start of each semester",
    where: "LAU and AUB",
    line: "Where most members start: a stand on campus, a conversation, and a form.",
    image: "event-open-day",
    stand: "platforms-cover", // shown until event-open-day.jpg exists
    tone: "day",
    sample: true,
  },
  {
    id: "impact-day",
    world: {
      // paint on the walls: raw plaster, colour flicked from the brushes
      scheme: "light", bg: "#f3efe6", ink: "#13201e", soft: "#4a5955", accent: "#0cb9c1", accentInk: "#056a70", line: "#ddd6c7", card: "#fffdf6",
      scenery: "paint", weather: { kind: "spray", density: 0.5 }, font: "marker", frame: "taped",
    },
    name: "Impact Day",
    kind: "Community",
    when: "Season to be confirmed",
    where: "Across Lebanon",
    line: "One day, many projects: volunteers from Lebanon and abroad working side by side with local partners.",
    image: "event-impact-day",
    stand: "program-volunteer", // shown until event-impact-day.jpg exists
    tone: "teal",
    sample: true,
  },
];
