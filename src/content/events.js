// EVENTS SHOWCASE
//
// SAMPLE CONTENT. Every entry marked `sample: true` is a placeholder written so the page can be
// designed. The event types are real AIESEC formats, but the descriptions, seasons and numbers
// are NOT facts about AIESEC in Lebanon. Replace them with real events before this goes live,
// then delete the `sample` flag. A banner on the page reminds you while you are developing.
//
// For each event: drop a photo in src/assets/gen/ named `<image>.jpg` (see README there).
// Until it exists, `stand` names one of the photographs already there to stand in for it.

export const EVENTS = [
  {
    id: "national-conference",
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
